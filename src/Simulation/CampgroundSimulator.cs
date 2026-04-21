using System;
using System.Collections.Generic;
using System.Linq;
using CampsiteEmpire.AI;

namespace CampsiteEmpire.Simulation;

public sealed class CampgroundSimulator
{
    private readonly ICampAiService _ai;
    private readonly Random _random = new();

    public CampgroundSimulator(ICampAiService ai)
    {
        _ai = ai;
    }

    public bool TryBuild(GameState state, StructureType type, int x, int y, out string message)
    {
        var definition = Buildables.All[type];
        var tile = state.TileAt(x, y);
        if (tile is null)
        {
            message = "That tile is outside the campground.";
            return false;
        }

        if (tile.StructureId.HasValue || state.StructureAt(x, y) is not null)
        {
            message = "That tile is already occupied.";
            return false;
        }

        if (!definition.AllowedTerrain.Contains(tile.Terrain))
        {
            message = $"{definition.DisplayName} cannot be placed on {tile.Terrain}.";
            return false;
        }

        if (state.Money < definition.BuildCost)
        {
            message = $"Not enough money for {definition.DisplayName}.";
            return false;
        }

        var structure = new StructureState { Type = type, X = x, Y = y };
        state.Structures.Add(structure);
        var tileIndex = state.Tiles.FindIndex(t => t.X == x && t.Y == y);
        state.Tiles[tileIndex] = tile with { StructureId = structure.Id };
        state.AddLedger("Build", $"Built {definition.DisplayName}", -definition.BuildCost);
        state.LastEvent = $"Built {definition.DisplayName}.";
        message = state.LastEvent;
        return true;
    }

    public async System.Threading.Tasks.Task TickAsync(GameState state)
    {
        state.Hour++;
        if (state.Hour >= 24)
        {
            state.Hour = 0;
            state.Day++;
            state.Season = SeasonForDay(state.Day);
        }

        if (state.Hour == 6) StartNewDay(state);
        if (state.Hour == 7) await MorningArrivalsAsync(state);
        if (state.Hour is >= 9 and <= 20) await UpdateSatisfactionAndChatterAsync(state);
        if (state.Hour == 21) BillNightlyRevenue(state);
        if (state.Hour == 22) ChargeMaintenance(state);
        if (state.Hour == 8) await DepartGuestsAsync(state);
    }

    public PlotDecision ScoreBestPlot(GameState state, TouristStateModel tourist)
    {
        var ranked = new List<PlotScore>();
        foreach (var plot in state.AvailablePlots())
        {
            var price = state.Pricing.GetPrice(plot.Type);
            var score = 50.0;
            score += plot.Type == tourist.Preferences.PreferredPlot ? 22 : -8;
            score += Math.Clamp((double)(tourist.Budget - price), -30, 25);
            score += FacilityScore(state, plot, tourist.Preferences.LikesFacilities);
            score -= FacilityScore(state, plot, tourist.Preferences.DislikesNearby) * 0.7;
            score += tourist.Preferences.LikesWater && NearTerrain(state, plot, TerrainType.Water, 3) ? 8 : 0;
            score += state.Reputation * 4;
            score += state.Weather switch
            {
                WeatherType.Sunny => 6,
                WeatherType.Cloudy => 1,
                WeatherType.Rain => -8,
                WeatherType.Storm => -18,
                WeatherType.Heatwave => plot.Type == StructureType.RvHookup ? 2 : -6,
                WeatherType.Chilly => plot.Type == StructureType.TentSite ? -7 : 1,
                _ => 0
            };

            ranked.Add(new PlotScore(plot.Id, Math.Round(score, 1), $"Fit {plot.Type}, price {price:C0}, facilities nearby."));
        }

        var ordered = ranked.OrderByDescending(r => r.Score).ToList();
        var best = ordered.FirstOrDefault();
        var stays = best is not null && best.Score >= 58;
        return new PlotDecision(stays ? best!.PlotId : null, stays, stays ? "Best available plot matches the guest." : "No plot cleared the comfort and value threshold.", ordered);
    }

    private void StartNewDay(GameState state)
    {
        var roll = _random.NextDouble();
        state.Weather = roll switch
        {
            < 0.38 => WeatherType.Sunny,
            < 0.60 => WeatherType.Cloudy,
            < 0.78 => WeatherType.Rain,
            < 0.88 => WeatherType.Chilly,
            < 0.96 => WeatherType.Heatwave,
            _ => WeatherType.Storm
        };

        var seasonModifier = state.Season switch
        {
            SeasonType.Spring => 1.0,
            SeasonType.Summer => 1.45,
            SeasonType.Autumn => 0.82,
            SeasonType.Winter => 0.48,
            _ => 1.0
        };
        var weatherModifier = state.Weather is WeatherType.Storm ? 0.35 : state.Weather is WeatherType.Rain ? 0.68 : 1.0;
        state.Demand = Math.Round(seasonModifier * weatherModifier * (0.55 + state.Reputation / 5), 2);
        state.LastEvent = $"Day {state.Day}: {state.Season}, {state.Weather}. Demand {state.Demand:0.00}x.";
    }

    private async System.Threading.Tasks.Task MorningArrivalsAsync(GameState state)
    {
        var capacity = state.AvailablePlots().Count();
        if (capacity <= 0)
        {
            state.LastEvent = "Tourists arrived, but no plots were available.";
            return;
        }

        var arrivals = Math.Clamp((int)Math.Ceiling(capacity * state.Demand * (0.35 + _random.NextDouble() * 0.4)), 1, Math.Max(1, capacity + 2));
        for (var i = 0; i < arrivals; i++)
        {
            var tourist = await _ai.GenerateTouristAsync(state, _random);
            state.Tourists.Add(tourist);
            var aiDecision = await _ai.SelectPlotAsync(state, tourist, ScoreBestPlot(state, tourist));
            if (aiDecision.Stay && aiDecision.SelectedPlotId.HasValue)
            {
                var plot = state.Structures.FirstOrDefault(s => s.Id == aiDecision.SelectedPlotId.Value && !s.IsOccupied);
                if (plot is null) continue;
                plot.IsOccupied = true;
                plot.TouristId = tourist.Id;
                tourist.State = TouristState.Staying;
                tourist.PlotId = plot.Id;
                tourist.LastReason = aiDecision.Reason;
                state.LastEvent = $"{tourist.Name} checked into {Buildables.All[plot.Type].DisplayName}.";
            }
            else
            {
                tourist.State = TouristState.LeftWithoutStaying;
                tourist.LastReason = aiDecision.Reason;
            }
        }
    }

    private async System.Threading.Tasks.Task UpdateSatisfactionAndChatterAsync(GameState state)
    {
        foreach (var tourist in state.Tourists.Where(t => t.State == TouristState.Staying))
        {
            var plot = state.Structures.FirstOrDefault(s => s.Id == tourist.PlotId);
            if (plot is null) continue;
            var delta = state.Weather switch
            {
                WeatherType.Sunny => 1.2,
                WeatherType.Cloudy => 0.2,
                WeatherType.Rain => -1.8,
                WeatherType.Storm => -4.5,
                WeatherType.Heatwave => -1.4,
                WeatherType.Chilly => -1.1,
                _ => 0
            };
            delta += FacilityScore(state, plot, tourist.Preferences.LikesFacilities) / 12;
            delta -= CrowdingPenalty(state, plot);
            var price = state.Pricing.GetPrice(plot.Type);
            if (price > tourist.Budget) delta -= 2.5;
            tourist.Satisfaction = Math.Clamp(tourist.Satisfaction + delta, 0, 100);

            if (_random.NextDouble() < 0.33)
            {
                state.Chatter.Add(await _ai.GenerateChatterAsync(state, tourist));
                TrimFeed(state.Chatter, 80);
            }
        }
    }

    private void BillNightlyRevenue(GameState state)
    {
        foreach (var plot in state.Structures.Where(s => s.IsOccupied && Buildables.All[s.Type].IsPlot))
        {
            var price = state.Pricing.GetPrice(plot.Type);
            state.AddLedger("Revenue", $"{Buildables.All[plot.Type].DisplayName} nightly stay", price);
            var tourist = state.Tourists.FirstOrDefault(t => t.Id == plot.TouristId);
            if (tourist is not null) tourist.NightsStayed++;
        }
        state.LastEvent = "Nightly plot revenue collected.";
    }

    private void ChargeMaintenance(GameState state)
    {
        var total = state.Structures.Sum(s => Buildables.All[s.Type].MaintenanceCost);
        if (total > 0) state.AddLedger("Maintenance", "Daily campground maintenance", -total);
        state.LastEvent = $"Maintenance charged: {total:C0}.";
    }

    private async System.Threading.Tasks.Task DepartGuestsAsync(GameState state)
    {
        foreach (var tourist in state.Tourists.Where(t => t.State == TouristState.Staying && t.NightsStayed >= t.StayNights).ToList())
        {
            var plot = state.Structures.FirstOrDefault(s => s.Id == tourist.PlotId);
            if (plot is not null)
            {
                plot.IsOccupied = false;
                plot.TouristId = null;
            }
            tourist.State = TouristState.Departed;
            var review = await _ai.GenerateReviewAsync(state, tourist);
            state.Reviews.Add(review);
            TrimFeed(state.Reviews, 60);
            state.RecalculateReputation();
            state.LastEvent = $"{tourist.Name} departed and left a {review.Stars}-star review.";
        }
    }

    private static SeasonType SeasonForDay(int day)
    {
        return ((day - 1) / 28 % 4) switch
        {
            0 => SeasonType.Spring,
            1 => SeasonType.Summer,
            2 => SeasonType.Autumn,
            _ => SeasonType.Winter
        };
    }

    private static double FacilityScore(GameState state, StructureState plot, IEnumerable<StructureType> facilityTypes)
    {
        var score = 0.0;
        foreach (var facility in facilityTypes)
        {
            var nearest = state.Structures
                .Where(s => s.Type == facility)
                .Select(s => Math.Abs(s.X - plot.X) + Math.Abs(s.Y - plot.Y))
                .DefaultIfEmpty(99)
                .Min();
            score += nearest <= 2 ? 12 : nearest <= 4 ? 6 : nearest <= 6 ? 2 : -2;
        }
        return score;
    }

    private static bool NearTerrain(GameState state, StructureState plot, TerrainType terrain, int distance)
    {
        return state.Tiles.Any(t => t.Terrain == terrain && Math.Abs(t.X - plot.X) + Math.Abs(t.Y - plot.Y) <= distance);
    }

    private static double CrowdingPenalty(GameState state, StructureState plot)
    {
        return state.Structures.Count(s => s.IsOccupied && s.Id != plot.Id && Math.Abs(s.X - plot.X) + Math.Abs(s.Y - plot.Y) <= 2) * 0.8;
    }

    private static void TrimFeed<T>(List<T> feed, int max)
    {
        if (feed.Count > max) feed.RemoveRange(0, feed.Count - max);
    }
}
