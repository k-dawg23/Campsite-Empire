using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampsiteEmpire.Simulation;

namespace CampsiteEmpire.AI;

public sealed record PlotScore(Guid PlotId, double Score, string Reason);
public sealed record PlotDecision(Guid? SelectedPlotId, bool Stay, string Reason, IReadOnlyList<PlotScore> RankedPlots);

public interface ICampAiService
{
    Task<TouristStateModel> GenerateTouristAsync(GameState state, Random random);
    Task<PlotDecision> SelectPlotAsync(GameState state, TouristStateModel tourist, PlotDecision fallbackDecision);
    Task<Chatter> GenerateChatterAsync(GameState state, TouristStateModel tourist);
    Task<Review> GenerateReviewAsync(GameState state, TouristStateModel tourist);
}
