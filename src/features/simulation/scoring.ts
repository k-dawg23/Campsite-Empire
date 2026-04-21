import { clamp } from '../../lib/random';
import { buildables } from './buildables';
import { priceFor } from './selectors';
import type { GameState, PlotDecision, StructureState, StructureType, TerrainType, TouristState } from './types';

export function scoreBestPlot(game: GameState, tourist: TouristState): PlotDecision {
  const rankedPlots = game.structures
    .filter((structure) => buildables[structure.type].isPlot && !structure.isOccupied)
    .map((plot) => {
      const price = priceFor(game, plot.type);
      let score = 50;
      score += plot.type === tourist.preferences.preferredPlot ? 22 : -8;
      score += clamp(tourist.budget - price, -30, 25);
      score += facilityScore(game, plot, tourist.preferences.likesFacilities);
      score -= facilityScore(game, plot, tourist.preferences.dislikesNearby) * 0.7;
      score += tourist.preferences.likesWater && nearTerrain(game, plot, 'water', 3) ? 8 : 0;
      score += game.reputation * 4;
      score += weatherModifier(game.weather, plot.type);
      return {
        plotId: plot.id,
        score: Math.round(score * 10) / 10,
        reason: `Fit ${buildables[plot.type].name}, price $${price}, facilities nearby.`
      };
    })
    .sort((left, right) => right.score - left.score);

  const best = rankedPlots[0];
  const stay = Boolean(best && best.score >= 58);
  return {
    selectedPlotId: stay ? best.plotId : undefined,
    stay,
    reason: stay ? 'Best available plot matches the guest.' : 'No plot cleared the comfort and value threshold.',
    rankedPlots
  };
}

export function facilityScore(game: GameState, plot: StructureState, facilityTypes: StructureType[]): number {
  return facilityTypes.reduce((score, facilityType) => {
    const nearest = game.structures
      .filter((structure) => structure.type === facilityType)
      .map((structure) => Math.abs(structure.x - plot.x) + Math.abs(structure.y - plot.y))
      .sort((left, right) => left - right)[0];
    const distance = nearest ?? 99;
    if (distance <= 2) return score + 12;
    if (distance <= 4) return score + 6;
    if (distance <= 6) return score + 2;
    return score - 2;
  }, 0);
}

export function nearTerrain(game: GameState, plot: StructureState, terrain: TerrainType, distance: number): boolean {
  return game.tiles.some(
    (tile) => tile.terrain === terrain && Math.abs(tile.x - plot.x) + Math.abs(tile.y - plot.y) <= distance
  );
}

export function crowdingPenalty(game: GameState, plot: StructureState): number {
  return (
    game.structures.filter(
      (structure) =>
        structure.isOccupied &&
        structure.id !== plot.id &&
        Math.abs(structure.x - plot.x) + Math.abs(structure.y - plot.y) <= 2
    ).length * 0.8
  );
}

function weatherModifier(weather: GameState['weather'], plotType: StructureType): number {
  if (weather === 'sunny') return 6;
  if (weather === 'cloudy') return 1;
  if (weather === 'rain') return -8;
  if (weather === 'storm') return -18;
  if (weather === 'heatwave') return plotType === 'rvHookup' ? 2 : -6;
  if (weather === 'chilly') return plotType === 'tentSite' ? -7 : 1;
  return 0;
}
