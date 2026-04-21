using System;
using System.Collections.Generic;
using System.Linq;

namespace CampsiteEmpire.Simulation;

public enum TerrainType { Grass, Water, Trees, Path, Sand }
public enum StructureType { TentSite, CampervanSpot, RvHookup, Restroom, Shower, FirePit, Playground, CampStore }
public enum TouristState { Arriving, Staying, Departed, LeftWithoutStaying }
public enum WeatherType { Sunny, Cloudy, Rain, Storm, Heatwave, Chilly }
public enum SeasonType { Spring, Summer, Autumn, Winter }

public sealed record TileState(int X, int Y, TerrainType Terrain, Guid? StructureId = null);

public sealed record BuildableDefinition(
    StructureType Type,
    string DisplayName,
    bool IsPlot,
    decimal BuildCost,
    decimal MaintenanceCost,
    decimal BasePrice,
    IReadOnlySet<TerrainType> AllowedTerrain,
    IReadOnlySet<StructureType> PreferredNearby);

public sealed class StructureState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public StructureType Type { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public bool IsOccupied { get; set; }
    public Guid? TouristId { get; set; }
}

public sealed class TouristPreferences
{
    public StructureType PreferredPlot { get; set; } = StructureType.TentSite;
    public List<StructureType> LikesFacilities { get; set; } = new();
    public List<StructureType> DislikesNearby { get; set; } = new();
    public bool LikesQuiet { get; set; }
    public bool LikesWater { get; set; }
}

public sealed class TouristStateModel
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "Guest";
    public string Personality { get; set; } = "easygoing";
    public decimal Budget { get; set; } = 35m;
    public TouristPreferences Preferences { get; set; } = new();
    public int StayNights { get; set; } = 1;
    public int NightsStayed { get; set; }
    public double Satisfaction { get; set; } = 72;
    public TouristState State { get; set; } = TouristState.Arriving;
    public Guid? PlotId { get; set; }
    public string LastReason { get; set; } = "";
}

public sealed record Review(Guid Id, Guid TouristId, int Day, int Stars, string Text, IReadOnlyList<string> Tags);
public sealed record Chatter(Guid Id, Guid TouristId, int Day, int Hour, string Mood, string Text);
public sealed record EconomyEntry(Guid Id, int Day, int Hour, string Kind, string Description, decimal Amount);

public sealed class PricingState
{
    public decimal TentSite { get; set; } = 22m;
    public decimal CampervanSpot { get; set; } = 38m;
    public decimal RvHookup { get; set; } = 54m;

    public decimal GetPrice(StructureType type) => type switch
    {
        StructureType.TentSite => TentSite,
        StructureType.CampervanSpot => CampervanSpot,
        StructureType.RvHookup => RvHookup,
        _ => 0m
    };

    public void Adjust(StructureType type, decimal delta)
    {
        switch (type)
        {
            case StructureType.TentSite:
                TentSite = Math.Clamp(TentSite + delta, 5m, 250m);
                break;
            case StructureType.CampervanSpot:
                CampervanSpot = Math.Clamp(CampervanSpot + delta, 5m, 250m);
                break;
            case StructureType.RvHookup:
                RvHookup = Math.Clamp(RvHookup + delta, 5m, 250m);
                break;
        }
    }
}

public sealed class GameState
{
    public const int MapSize = 16;

    public int SchemaVersion { get; set; } = 1;
    public int Day { get; set; } = 1;
    public int Hour { get; set; } = 6;
    public SeasonType Season { get; set; } = SeasonType.Spring;
    public WeatherType Weather { get; set; } = WeatherType.Sunny;
    public decimal Money { get; set; } = 1800m;
    public double Reputation { get; set; } = 3.4;
    public double Demand { get; set; } = 1.0;
    public PricingState Pricing { get; set; } = new();
    public List<TileState> Tiles { get; set; } = new();
    public List<StructureState> Structures { get; set; } = new();
    public List<TouristStateModel> Tourists { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Chatter> Chatter { get; set; } = new();
    public List<EconomyEntry> Ledger { get; set; } = new();
    public string LastEvent { get; set; } = "Welcome to Campsite Empire.";

    public static GameState NewGame()
    {
        var state = new GameState();
        for (var y = 0; y < MapSize; y++)
        {
            for (var x = 0; x < MapSize; x++)
            {
                var terrain = TerrainType.Grass;
                if (x < 3 && y > 10) terrain = TerrainType.Water;
                else if (x > 11 && y < 5) terrain = TerrainType.Trees;
                else if (y == 7 || x == 7) terrain = TerrainType.Path;
                else if (x < 5 && y < 4) terrain = TerrainType.Sand;
                else if ((x + y) % 13 == 0) terrain = TerrainType.Trees;
                state.Tiles.Add(new TileState(x, y, terrain));
            }
        }

        state.PlaceStarterStructure(StructureType.TentSite, 5, 6);
        state.PlaceStarterStructure(StructureType.TentSite, 6, 6);
        state.PlaceStarterStructure(StructureType.CampervanSpot, 8, 6);
        state.PlaceStarterStructure(StructureType.Restroom, 7, 8);
        state.PlaceStarterStructure(StructureType.FirePit, 6, 8);
        state.PlaceStarterStructure(StructureType.CampStore, 8, 8);
        return state;
    }

    public IEnumerable<StructureState> AvailablePlots()
    {
        return Structures.Where(s => Buildables.All[s.Type].IsPlot && !s.IsOccupied);
    }

    public TileState? TileAt(int x, int y) => Tiles.FirstOrDefault(t => t.X == x && t.Y == y);

    public StructureState? StructureAt(int x, int y) => Structures.FirstOrDefault(s => s.X == x && s.Y == y);

    public void AddLedger(string kind, string description, decimal amount)
    {
        Ledger.Add(new EconomyEntry(Guid.NewGuid(), Day, Hour, kind, description, amount));
        Money += amount;
    }

    public void RecalculateReputation()
    {
        if (Reviews.Count == 0) return;
        var average = Reviews.Average(r => r.Stars);
        Reputation = Math.Clamp((Reputation * 0.72) + (average * 0.28), 1.0, 5.0);
    }

    private void PlaceStarterStructure(StructureType type, int x, int y)
    {
        var structure = new StructureState { Type = type, X = x, Y = y };
        Structures.Add(structure);
        var index = Tiles.FindIndex(t => t.X == x && t.Y == y);
        if (index >= 0) Tiles[index] = Tiles[index] with { StructureId = structure.Id };
    }
}

public static class Buildables
{
    public static readonly IReadOnlyDictionary<StructureType, BuildableDefinition> All =
        new Dictionary<StructureType, BuildableDefinition>
        {
            [StructureType.TentSite] = new(StructureType.TentSite, "Tent Site", true, 90m, 2m, 22m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Sand }, new HashSet<StructureType> { StructureType.Restroom, StructureType.FirePit }),
            [StructureType.CampervanSpot] = new(StructureType.CampervanSpot, "Campervan Spot", true, 180m, 4m, 38m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Path, TerrainType.Sand }, new HashSet<StructureType> { StructureType.Shower, StructureType.CampStore }),
            [StructureType.RvHookup] = new(StructureType.RvHookup, "RV Hookup", true, 300m, 7m, 54m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Path }, new HashSet<StructureType> { StructureType.Shower, StructureType.CampStore, StructureType.Restroom }),
            [StructureType.Restroom] = new(StructureType.Restroom, "Restroom", false, 260m, 9m, 0m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Path, TerrainType.Sand }, new HashSet<StructureType>()),
            [StructureType.Shower] = new(StructureType.Shower, "Showers", false, 340m, 12m, 0m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Path }, new HashSet<StructureType>()),
            [StructureType.FirePit] = new(StructureType.FirePit, "Fire Pit", false, 80m, 1m, 0m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Sand }, new HashSet<StructureType>()),
            [StructureType.Playground] = new(StructureType.Playground, "Playground", false, 210m, 5m, 0m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Sand }, new HashSet<StructureType>()),
            [StructureType.CampStore] = new(StructureType.CampStore, "Camp Store", false, 520m, 16m, 0m, new HashSet<TerrainType> { TerrainType.Grass, TerrainType.Path }, new HashSet<StructureType>())
        };
}
