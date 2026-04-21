using System;
using System.Linq;
using CampsiteEmpire.AI;
using CampsiteEmpire.Persistence;

namespace CampsiteEmpire.Simulation;

public static class SimulationSelfTests
{
    public static void Run()
    {
        PlacementValidation();
        PlotScoring();
        SatisfactionAndEconomyTicks();
        JsonExtractionFallbackShape();
        EnvFileConfiguration();
        SaveRoundTrip();
    }

    private static void PlacementValidation()
    {
        var state = GameState.NewGame();
        var simulator = new CampgroundSimulator(new TemplateAiService());
        if (simulator.TryBuild(state, StructureType.TentSite, 0, 12, out _))
        {
            throw new InvalidOperationException("Tent sites should not build on water.");
        }
        if (!simulator.TryBuild(state, StructureType.TentSite, 4, 4, out _))
        {
            throw new InvalidOperationException("Tent sites should build on empty grass.");
        }
    }

    private static void PlotScoring()
    {
        var state = GameState.NewGame();
        var simulator = new CampgroundSimulator(new TemplateAiService());
        var tourist = new TouristStateModel
        {
            Budget = 80,
            Preferences = new TouristPreferences
            {
                PreferredPlot = StructureType.CampervanSpot,
                LikesFacilities = { StructureType.CampStore, StructureType.Shower }
            }
        };
        var decision = simulator.ScoreBestPlot(state, tourist);
        if (!decision.RankedPlots.Any())
        {
            throw new InvalidOperationException("Plot scoring should rank available plots.");
        }
    }

    private static void JsonExtractionFallbackShape()
    {
        using var doc = JsonObjectExtractor.ParseFirstObject("noise {\"stars\":5,\"text\":\"Great\"} tail");
        if (doc is null || doc.RootElement.GetProperty("stars").GetInt32() != 5)
        {
            throw new InvalidOperationException("AI parser should extract the first JSON object.");
        }
    }

    private static void EnvFileConfiguration()
    {
        var parsed = EnvFileLoader.Parse(new[]
        {
            "# local model",
            "",
            "CAMPSITE_AI_PROVIDER = ollama",
            "CAMPSITE_AI_URL=\"http://localhost:11434/api/generate\"",
            "CAMPSITE_AI_MODEL='llama3.1'",
            "not valid",
            "1_BAD=value"
        });
        if (parsed.Count != 3 || parsed[AiConfiguration.ProviderKey] != "ollama")
        {
            throw new InvalidOperationException(".env parser should keep valid key/value lines and ignore malformed lines.");
        }

        var resolved = AiConfiguration.From(parsed, key => key == AiConfiguration.ModelKey ? "mistral" : null);
        if (resolved.Provider != "ollama" || resolved.Model != "mistral")
        {
            throw new InvalidOperationException("OS environment values should override .env values.");
        }
    }


    private static void SatisfactionAndEconomyTicks()
    {
        var state = GameState.NewGame();
        var simulator = new CampgroundSimulator(new TemplateAiService());
        var tourist = new TouristStateModel
        {
            State = TouristState.Staying,
            PlotId = state.Structures.First(s => s.Type == StructureType.TentSite).Id,
            StayNights = 1,
            Budget = 50,
            Preferences = new TouristPreferences { PreferredPlot = StructureType.TentSite }
        };
        state.Tourists.Add(tourist);
        var plot = state.Structures.First(s => s.Id == tourist.PlotId);
        plot.IsOccupied = true;
        plot.TouristId = tourist.Id;
        state.Hour = 20;
        var moneyBefore = state.Money;

        simulator.TickAsync(state).GetAwaiter().GetResult();
        if (state.Money <= moneyBefore)
        {
            throw new InvalidOperationException("Nightly revenue should increase money before maintenance.");
        }
        if (!state.Ledger.Any(e => e.Kind == "Revenue"))
        {
            throw new InvalidOperationException("Economy ticks should write revenue ledger entries.");
        }
    }

    private static void SaveRoundTrip()
    {
        var path = System.IO.Path.Combine(System.IO.Path.GetTempPath(), $"campsite-empire-test-{Guid.NewGuid():N}.sqlite");
        var repository = new SqliteSaveRepository(path);
        var state = GameState.NewGame();
        state.Money = 1234;
        repository.SaveAsync(state).GetAwaiter().GetResult();
        var loaded = repository.LoadOrCreateAsync().GetAwaiter().GetResult();
        if (loaded.Money != 1234 || loaded.Tiles.Count != GameState.MapSize * GameState.MapSize)
        {
            throw new InvalidOperationException("SQLite save/load should round-trip full game state.");
        }
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
    }
}
