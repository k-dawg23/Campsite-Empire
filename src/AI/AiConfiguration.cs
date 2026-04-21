using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Godot;

namespace CampsiteEmpire.AI;

public sealed record AiConfiguration(string Provider, string Url, string Model)
{
    public const string ProviderKey = "CAMPSITE_AI_PROVIDER";
    public const string UrlKey = "CAMPSITE_AI_URL";
    public const string ModelKey = "CAMPSITE_AI_MODEL";

    public static AiConfiguration Load()
    {
        var fileValues = EnvFileLoader.LoadFirstExisting(DefaultEnvPaths());
        return From(fileValues, System.Environment.GetEnvironmentVariable);
    }

    public static AiConfiguration From(IReadOnlyDictionary<string, string> fileValues, Func<string, string?> readEnvironment)
    {
        return new AiConfiguration(
            Resolve(ProviderKey, "", fileValues, readEnvironment),
            Resolve(UrlKey, "http://localhost:11434/api/generate", fileValues, readEnvironment),
            Resolve(ModelKey, "llama3.1", fileValues, readEnvironment));
    }

    private static string Resolve(
        string key,
        string fallback,
        IReadOnlyDictionary<string, string> fileValues,
        Func<string, string?> readEnvironment)
    {
        var environmentValue = readEnvironment(key);
        if (!string.IsNullOrWhiteSpace(environmentValue)) return environmentValue.Trim();
        return fileValues.TryGetValue(key, out var fileValue) && !string.IsNullOrWhiteSpace(fileValue)
            ? fileValue.Trim()
            : fallback;
    }

    private static IEnumerable<string> DefaultEnvPaths()
    {
        var paths = new List<string>();

        TryAdd(paths, Path.Combine(Directory.GetCurrentDirectory(), ".env"));
        TryAdd(paths, Path.Combine(AppContext.BaseDirectory, ".env"));

        try
        {
            var resourcePath = ProjectSettings.GlobalizePath("res://.env");
            TryAdd(paths, resourcePath);
        }
        catch
        {
            // Godot APIs may be unavailable in plain C# self-tests.
        }

        try
        {
            var userPath = ProjectSettings.GlobalizePath("user://.env");
            TryAdd(paths, userPath);
        }
        catch
        {
            // Godot APIs may be unavailable in plain C# self-tests.
        }

        return paths.Distinct(StringComparer.OrdinalIgnoreCase);
    }

    private static void TryAdd(ICollection<string> paths, string path)
    {
        if (!string.IsNullOrWhiteSpace(path)) paths.Add(path);
    }
}

public static class EnvFileLoader
{
    public static IReadOnlyDictionary<string, string> LoadFirstExisting(IEnumerable<string> paths)
    {
        foreach (var path in paths)
        {
            if (!File.Exists(path)) continue;
            return Parse(File.ReadAllLines(path));
        }

        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    }

    public static IReadOnlyDictionary<string, string> Parse(IEnumerable<string> lines)
    {
        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#')) continue;

            var separator = line.IndexOf('=');
            if (separator <= 0) continue;

            var key = line[..separator].Trim();
            var value = line[(separator + 1)..].Trim();
            if (!IsValidKey(key)) continue;

            if (value.Length >= 2)
            {
                var first = value[0];
                var last = value[^1];
                if ((first == '"' && last == '"') || (first == '\'' && last == '\''))
                {
                    value = value[1..^1];
                }
            }

            values[key] = value;
        }

        return values;
    }

    private static bool IsValidKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) return false;
        if (!(char.IsLetter(key[0]) || key[0] == '_')) return false;
        return key.All(c => char.IsLetterOrDigit(c) || c == '_');
    }
}
