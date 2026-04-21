import { describe, expect, it } from 'vitest';
import { gameSlice, placeSelectedBuild, runHourlyTick } from '../src/features/simulation/gameSlice';
import { canPlaceStructure, createNewGame } from '../src/features/simulation/newGame';
import { scoreBestPlot } from '../src/features/simulation/scoring';
import { selectAvailablePlots, selectOccupancy } from '../src/features/simulation/selectors';
import type { RootLike } from '../src/features/simulation/selectors';
import type { TouristState } from '../src/features/simulation/types';

describe('simulation reducers and selectors', () => {
  it('validates terrain and occupancy before placement', () => {
    const state = createNewGame();
    expect(canPlaceStructure(state, 'tentSite', 0, 12)).toBe('Tent Site cannot be placed on water.');
    expect(canPlaceStructure(state, 'tentSite', 4, 4)).toBe(true);
  });

  it('places selected structures and updates occupancy metadata', () => {
    const state = createNewGame();
    const next = gameSlice.reducer(state, placeSelectedBuild({ x: 4, y: 4 }));
    expect(next.structures.some((structure) => structure.x === 4 && structure.y === 4)).toBe(true);
    expect(next.money).toBeLessThan(state.money);
    expect(selectAvailablePlots({ game: next } satisfies RootLike).length).toBeGreaterThan(0);
    expect(selectOccupancy({ game: next } satisfies RootLike).total).toBeGreaterThan(0);
  });

  it('scores plots using price, preferences, reputation, and facilities', () => {
    const state = createNewGame();
    const tourist: TouristState = {
      id: 'tourist-test',
      name: 'Test Guest',
      personality: 'comfort seeker',
      budget: 80,
      preferences: {
        preferredPlot: 'campervanSpot',
        likesFacilities: ['campStore', 'shower'],
        dislikesNearby: [],
        likesQuiet: false,
        likesWater: false
      },
      stayNights: 2,
      nightsStayed: 0,
      satisfaction: 72,
      state: 'arriving',
      lastReason: ''
    };
    const decision = scoreBestPlot(state, tourist);
    expect(decision.rankedPlots.length).toBeGreaterThan(0);
    expect(decision.rankedPlots[0].score).toBeGreaterThan(40);
  });

  it('advances economy and satisfaction on fulfilled tick payloads', () => {
    const state = createNewGame();
    state.hour = 20;
    const plot = state.structures.find((structure) => structure.type === 'tentSite')!;
    const tourist: TouristState = {
      id: 'tourist-staying',
      name: 'Revenue Guest',
      personality: 'weekend explorer',
      budget: 55,
      preferences: {
        preferredPlot: 'tentSite',
        likesFacilities: ['restroom'],
        dislikesNearby: [],
        likesQuiet: false,
        likesWater: false
      },
      stayNights: 1,
      nightsStayed: 0,
      satisfaction: 70,
      state: 'staying',
      plotId: plot.id,
      lastReason: ''
    };
    plot.isOccupied = true;
    plot.touristId = tourist.id;
    state.tourists.push(tourist);
    const next = gameSlice.reducer(
      state,
      runHourlyTick.fulfilled({ aiTourists: [], aiDecisions: [], aiChatter: [], aiReviews: [] }, 'req')
    );
    expect(next.hour).toBe(21);
    expect(next.money).toBeGreaterThan(state.money);
    expect(next.ledger.some((entry) => entry.kind === 'revenue')).toBe(true);
  });
});
