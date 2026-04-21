using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CampsiteEmpire.Simulation;

namespace CampsiteEmpire.AI;

public sealed class TemplateAiService : ICampAiService
{
    private static readonly string[] FirstNames = { "Mara", "Eli", "Jules", "Nora", "Theo", "Sam", "Iris", "Cal", "Rina", "Owen" };
    private static readonly string[] Personalities = { "quiet stargazer", "budget backpacker", "family planner", "comfort seeker", "campfire storyteller", "weekend explorer" };

    public Task<TouristStateModel> GenerateTouristAsync(GameState state, Random random)
    {
        var plotPreference = random.Next(3) switch
        {
            0 => StructureType.TentSite,
            1 => StructureType.CampervanSpot,
            _ => StructureType.RvHookup
        };
        var personality = Personalities[random.Next(Personalities.Length)];
        var tourist = new TouristStateModel
        {
            Name = $"{FirstNames[random.Next(FirstNames.Length)]} {random.Next(10, 99)}",
            Personality = personality,
            Budget = plotPreference switch
            {
                StructureType.TentSite => random.Next(18, 42),
                StructureType.CampervanSpot => random.Next(34, 70),
                _ => random.Next(48, 96)
            },
            StayNights = random.Next(1, 4),
            Satisfaction = random.Next(62, 84),
            Preferences = new TouristPreferences
            {
                PreferredPlot = plotPreference,
                LikesQuiet = personality.Contains("quiet", StringComparison.OrdinalIgnoreCase),
                LikesWater = random.NextDouble() < 0.4,
                LikesFacilities = Buildables.All[plotPreference].PreferredNearby.ToList(),
                DislikesNearby = personality.Contains("quiet", StringComparison.OrdinalIgnoreCase)
                    ? new List<StructureType> { StructureType.Playground, StructureType.CampStore }
                    : new List<StructureType>()
            }
        };
        return Task.FromResult(tourist);
    }

    public Task<PlotDecision> SelectPlotAsync(GameState state, TouristStateModel tourist, PlotDecision fallbackDecision)
    {
        return Task.FromResult(fallbackDecision);
    }

    public Task<Chatter> GenerateChatterAsync(GameState state, TouristStateModel tourist)
    {
        var mood = tourist.Satisfaction switch
        {
            >= 82 => "delighted",
            >= 62 => "content",
            >= 42 => "uneasy",
            _ => "unhappy"
        };
        var text = mood switch
        {
            "delighted" => "This place has the makings of a yearly tradition.",
            "content" => "Nice setup. I can get to what I need without a hike.",
            "uneasy" => "The campground is okay, but a few comforts would help.",
            _ => "I am counting the hours until checkout."
        };
        return Task.FromResult(new Chatter(Guid.NewGuid(), tourist.Id, state.Day, state.Hour, mood, $"{tourist.Name}: {text}"));
    }

    public Task<Review> GenerateReviewAsync(GameState state, TouristStateModel tourist)
    {
        var stars = tourist.Satisfaction switch
        {
            >= 86 => 5,
            >= 70 => 4,
            >= 52 => 3,
            >= 34 => 2,
            _ => 1
        };
        var text = stars switch
        {
            5 => "Beautiful campground, fair pricing, and the facilities were exactly where I needed them.",
            4 => "A relaxing stay with good value. A little more polish and it would be perfect.",
            3 => "Decent campsite, but the comfort depended a lot on weather and nearby amenities.",
            2 => "The basics were there, though the price and comfort did not quite line up.",
            _ => "I left disappointed. Better facilities and quieter plots would make a big difference."
        };
        return Task.FromResult(new Review(Guid.NewGuid(), tourist.Id, state.Day, stars, text, TagsFor(stars)));
    }

    private static IReadOnlyList<string> TagsFor(int stars)
    {
        return stars >= 4 ? new[] { "value", "facilities" } : new[] { "comfort", "pricing" };
    }
}
