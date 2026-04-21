using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CampsiteEmpire.Simulation;

namespace CampsiteEmpire.AI;

public sealed class LocalAiService : ICampAiService
{
    private readonly ICampAiService _fallback = new TemplateAiService();
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(3) };
    private readonly string _provider;
    private readonly string _url;
    private readonly string _model;

    public LocalAiService()
    {
        var configuration = AiConfiguration.Load();
        _provider = configuration.Provider;
        _url = configuration.Url;
        _model = configuration.Model;
    }

    public async Task<TouristStateModel> GenerateTouristAsync(GameState state, Random random)
    {
        var fallback = await _fallback.GenerateTouristAsync(state, random);
        var prompt = """
Return one JSON object only with schema:
{"name":"string","personality":"string","budget":number,"preferred_plot":"TentSite|CampervanSpot|RvHookup","likes_facilities":["Restroom"],"dislikes_nearby":["Playground"],"likes_quiet":boolean,"likes_water":boolean,"stay_nights":number}
Create a plausible campground tourist.
""";
        var doc = await AskAsync(prompt);
        if (doc is null) return fallback;
        try
        {
            var root = doc.RootElement;
            fallback.Name = ReadString(root, "name", fallback.Name, 32);
            fallback.Personality = ReadString(root, "personality", fallback.Personality, 48);
            fallback.Budget = Math.Clamp(ReadDecimal(root, "budget", fallback.Budget), 5m, 250m);
            fallback.StayNights = Math.Clamp(ReadInt(root, "stay_nights", fallback.StayNights), 1, 7);
            fallback.Preferences.PreferredPlot = ParseStructure(ReadString(root, "preferred_plot", fallback.Preferences.PreferredPlot.ToString(), 32), fallback.Preferences.PreferredPlot);
            fallback.Preferences.LikesQuiet = ReadBool(root, "likes_quiet", fallback.Preferences.LikesQuiet);
            fallback.Preferences.LikesWater = ReadBool(root, "likes_water", fallback.Preferences.LikesWater);
            fallback.Preferences.LikesFacilities = ReadStructureArray(root, "likes_facilities");
            fallback.Preferences.DislikesNearby = ReadStructureArray(root, "dislikes_nearby");
            return fallback;
        }
        catch
        {
            return fallback;
        }
    }

    public async Task<PlotDecision> SelectPlotAsync(GameState state, TouristStateModel tourist, PlotDecision fallbackDecision)
    {
        var plots = string.Join(", ", fallbackDecision.RankedPlots.Select(p => $"{{\"plot_id\":\"{p.PlotId}\",\"score\":{p.Score}}}"));
        var prompt = $$"""
Return one JSON object only with schema:
{"stay":boolean,"selected_plot_id":"guid-or-null","reason":"string"}
Tourist: {{tourist.Name}}, budget {{tourist.Budget}}, personality {{tourist.Personality}}.
Ranked plots: [{{plots}}]
Choose whether the tourist stays.
""";
        var doc = await AskAsync(prompt);
        if (doc is null) return fallbackDecision;
        try
        {
            var root = doc.RootElement;
            var stay = ReadBool(root, "stay", fallbackDecision.Stay);
            var rawId = ReadString(root, "selected_plot_id", fallbackDecision.SelectedPlotId?.ToString() ?? "", 80);
            var id = Guid.TryParse(rawId, out var parsed) ? parsed : fallbackDecision.SelectedPlotId;
            if (stay && id.HasValue && fallbackDecision.RankedPlots.Any(p => p.PlotId == id.Value))
            {
                return fallbackDecision with { SelectedPlotId = id, Stay = true, Reason = ReadString(root, "reason", fallbackDecision.Reason, 120) };
            }
            return fallbackDecision with { SelectedPlotId = null, Stay = false, Reason = ReadString(root, "reason", fallbackDecision.Reason, 120) };
        }
        catch
        {
            return fallbackDecision;
        }
    }

    public async Task<Chatter> GenerateChatterAsync(GameState state, TouristStateModel tourist)
    {
        var fallback = await _fallback.GenerateChatterAsync(state, tourist);
        var prompt = $$"""
Return one JSON object only with schema:
{"mood":"string","text":"string"}
Write short campground guest chatter for {{tourist.Name}}. Satisfaction {{tourist.Satisfaction:0}}, weather {{state.Weather}}.
""";
        var doc = await AskAsync(prompt);
        if (doc is null) return fallback;
        try
        {
            var root = doc.RootElement;
            return fallback with
            {
                Mood = ReadString(root, "mood", fallback.Mood, 24),
                Text = $"{tourist.Name}: {ReadString(root, "text", fallback.Text, 140)}"
            };
        }
        catch
        {
            return fallback;
        }
    }

    public async Task<Review> GenerateReviewAsync(GameState state, TouristStateModel tourist)
    {
        var fallback = await _fallback.GenerateReviewAsync(state, tourist);
        var prompt = $$"""
Return one JSON object only with schema:
{"stars":1,"text":"string","tags":["string"]}
Write a campground review for {{tourist.Name}}. Satisfaction {{tourist.Satisfaction:0}}.
""";
        var doc = await AskAsync(prompt);
        if (doc is null) return fallback;
        try
        {
            var root = doc.RootElement;
            return fallback with
            {
                Stars = Math.Clamp(ReadInt(root, "stars", fallback.Stars), 1, 5),
                Text = ReadString(root, "text", fallback.Text, 220)
            };
        }
        catch
        {
            return fallback;
        }
    }

    private async Task<JsonDocument?> AskAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_provider)) return null;
        try
        {
            var payload = BuildPayload(prompt);
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync(_url, content);
            if (!response.IsSuccessStatusCode) return null;
            var body = await response.Content.ReadAsStringAsync();
            var text = ExtractProviderText(body);
            return JsonObjectExtractor.ParseFirstObject(text);
        }
        catch
        {
            return null;
        }
    }

    private string BuildPayload(string prompt)
    {
        if (_provider.Equals("ollama", StringComparison.OrdinalIgnoreCase))
        {
            return JsonSerializer.Serialize(new { model = _model, prompt, stream = false, format = "json" });
        }

        if (_provider.Equals("llamacpp", StringComparison.OrdinalIgnoreCase) ||
            _provider.Equals("lmstudio", StringComparison.OrdinalIgnoreCase) ||
            _url.Contains("/v1/chat/completions", StringComparison.OrdinalIgnoreCase))
        {
            return JsonSerializer.Serialize(new
            {
                model = _model,
                stream = false,
                temperature = 0.7,
                messages = new[]
                {
                    new { role = "system", content = "Return exactly one valid JSON object and no markdown." },
                    new { role = "user", content = prompt }
                }
            });
        }

        return JsonSerializer.Serialize(new { model = _model, prompt, stream = false });
    }

    private static string ExtractProviderText(string body)
    {
        using var wrapper = JsonObjectExtractor.ParseFirstObject(body);
        if (wrapper is null) return body;

        var root = wrapper.RootElement;
        if (root.TryGetProperty("response", out var responseProperty))
        {
            return responseProperty.GetString() ?? body;
        }

        if (root.TryGetProperty("content", out var contentProperty))
        {
            return contentProperty.GetString() ?? body;
        }

        if (root.TryGetProperty("choices", out var choicesProperty) &&
            choicesProperty.ValueKind == JsonValueKind.Array &&
            choicesProperty.GetArrayLength() > 0)
        {
            var firstChoice = choicesProperty[0];
            if (firstChoice.TryGetProperty("message", out var messageProperty) &&
                messageProperty.TryGetProperty("content", out var messageContentProperty))
            {
                return messageContentProperty.GetString() ?? body;
            }

            if (firstChoice.TryGetProperty("text", out var textProperty))
            {
                return textProperty.GetString() ?? body;
            }
        }

        return body;
    }

    private static string ReadString(JsonElement root, string name, string fallback, int max)
    {
        if (!root.TryGetProperty(name, out var value) || value.ValueKind != JsonValueKind.String) return fallback;
        var text = value.GetString();
        if (string.IsNullOrWhiteSpace(text)) return fallback;
        return text.Length <= max ? text : text[..max];
    }

    private static int ReadInt(JsonElement root, string name, int fallback)
    {
        return root.TryGetProperty(name, out var value) && value.TryGetInt32(out var number) ? number : fallback;
    }

    private static decimal ReadDecimal(JsonElement root, string name, decimal fallback)
    {
        return root.TryGetProperty(name, out var value) && value.TryGetDecimal(out var number) ? number : fallback;
    }

    private static bool ReadBool(JsonElement root, string name, bool fallback)
    {
        return root.TryGetProperty(name, out var value) && value.ValueKind is JsonValueKind.True or JsonValueKind.False ? value.GetBoolean() : fallback;
    }

    private static StructureType ParseStructure(string value, StructureType fallback)
    {
        return Enum.TryParse<StructureType>(value, true, out var parsed) ? parsed : fallback;
    }

    private static System.Collections.Generic.List<StructureType> ReadStructureArray(JsonElement root, string name)
    {
        if (!root.TryGetProperty(name, out var value) || value.ValueKind != JsonValueKind.Array) return new();
        return value.EnumerateArray()
            .Where(e => e.ValueKind == JsonValueKind.String)
            .Select(e => ParseStructure(e.GetString() ?? "", StructureType.Restroom))
            .Where(t => !Buildables.All[t].IsPlot)
            .Distinct()
            .Take(4)
            .ToList();
    }
}
