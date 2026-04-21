import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { clamp, makeId } from '../../lib/random';
import {
  generateChatterWithAi,
  generateReviewWithAi,
  generateTouristWithAi,
  selectPlotWithAi,
  type AiResult
} from '../ai/client';
import { generateFallbackChatter, generateFallbackReview } from '../ai/fallbacks';
import { buildables } from './buildables';
import { canPlaceStructure, createNewGame } from './newGame';
import { priceFor } from './selectors';
import { crowdingPenalty, facilityScore, scoreBestPlot } from './scoring';
import type {
  Chatter,
  EconomyEntry,
  GameState,
  PlotDecision,
  Review,
  SeasonType,
  Speed,
  StructureState,
  StructureType,
  TouristState,
  WeatherType
} from './types';

export const runHourlyTick = createAsyncThunk('game/runHourlyTick', async (_, { getState }) => {
  const state = getState() as { game: GameState };
  const preview = previewNextHour(state.game);
  const aiTourists: Array<AiResult<TouristState>> = [];
  const aiDecisions: Array<{ touristId: string; result: AiResult<PlotDecision> }> = [];
  const aiChatter: Array<AiResult<Chatter>> = [];
  const aiReviews: Array<{ touristId: string; result: AiResult<Review> }> = [];

  if (preview.hour === 7) {
    const capacity = state.game.structures.filter((structure) => buildables[structure.type].isPlot && !structure.isOccupied).length;
    const arrivals = Math.max(1, Math.min(capacity + 2, Math.ceil(capacity * state.game.demand * 0.55)));
    for (let index = 0; index < arrivals && capacity > 0; index += 1) {
      const tourist = await generateTouristWithAi(state.game);
      const decision = scoreBestPlot({ ...state.game, tourists: [...state.game.tourists, tourist.value] }, tourist.value);
      const aiDecision = await selectPlotWithAi(tourist.value, decision);
      aiTourists.push(tourist);
      aiDecisions.push({ touristId: tourist.value.id, result: aiDecision });
    }
  }

  if (preview.hour >= 9 && preview.hour <= 20) {
    for (const tourist of state.game.tourists.filter((candidate) => candidate.state === 'staying')) {
      if (Math.random() < 0.35) aiChatter.push(await generateChatterWithAi(state.game, tourist));
    }
  }

  if (preview.hour === 8) {
    for (const tourist of state.game.tourists.filter(
      (candidate) => candidate.state === 'staying' && candidate.nightsStayed >= candidate.stayNights
    )) {
      aiReviews.push({ touristId: tourist.id, result: await generateReviewWithAi(state.game, tourist) });
    }
  }

  return { aiTourists, aiDecisions, aiChatter, aiReviews };
});

const initialState = createNewGame();
const currentVersion = '2.0.4';

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    resetGame: () => createNewGame(),
    hydrateGame: (_state, action: PayloadAction<GameState>) => ({
      ...action.payload,
      version: currentVersion
    }),
    setSpeed(state, action: PayloadAction<Speed>) {
      state.speed = action.payload;
      state.lastEvent = action.payload === 0 ? 'Simulation paused.' : `Simulation running at ${action.payload}x.`;
    },
    selectBuild(state, action: PayloadAction<StructureType>) {
      if (state.money < buildables[action.payload].buildCost) {
        state.lastEvent = `Not enough money for ${buildables[action.payload].name}.`;
        return;
      }
      state.selectedBuild = action.payload;
    },
    selectTile(state, action: PayloadAction<{ x: number; y: number }>) {
      state.selectedTile = action.payload;
    },
    placeSelectedBuild(state, action: PayloadAction<{ x: number; y: number }>) {
      const { x, y } = action.payload;
      const type = state.selectedBuild;
      const validation = canPlaceStructure(state, type, x, y);
      state.selectedTile = { x, y };
      if (validation !== true) {
        state.lastEvent = validation;
        return;
      }
      const definition = buildables[type];
      const structure: StructureState = {
        id: makeId('structure'),
        type,
        x,
        y,
        isOccupied: false
      };
      state.structures.push(structure);
      const tile = state.tiles.find((candidate) => candidate.x === x && candidate.y === y);
      if (tile) tile.structureId = structure.id;
      state.money -= definition.buildCost;
      addLedger(state, 'build', `Built ${definition.name}`, -definition.buildCost);
      state.lastEvent = `Built ${definition.name}.`;
    },
    adjustPrice(state, action: PayloadAction<{ type: StructureType; delta: number }>) {
      const { type, delta } = action.payload;
      if (type === 'tentSite') state.pricing.tentSite = clamp(state.pricing.tentSite + delta, 5, 250);
      if (type === 'campervanSpot') state.pricing.campervanSpot = clamp(state.pricing.campervanSpot + delta, 5, 250);
      if (type === 'rvHookup') state.pricing.rvHookup = clamp(state.pricing.rvHookup + delta, 5, 250);
      state.lastEvent = 'Pricing updated.';
    },
    markSaved(state) {
      state.lastSavedAt = new Date().toISOString();
    }
  },
  extraReducers(builder) {
    builder.addCase(runHourlyTick.fulfilled, (state, action) => {
      advanceClock(state);
      if (state.hour === 6) startNewDay(state);
      for (const result of action.payload.aiTourists) recordAi(state, result);
      if (state.hour === 7) processArrivals(state, action.payload.aiTourists, action.payload.aiDecisions);
      if (state.hour >= 9 && state.hour <= 20) {
        updateSatisfaction(state);
        for (const result of action.payload.aiChatter) {
          recordAi(state, result);
          state.chatter.push(result.value);
        }
        trimFeed(state.chatter, 80);
      }
      if (state.hour === 21) billRevenue(state);
      if (state.hour === 22) chargeMaintenance(state);
      if (state.hour === 8) processDepartures(state, action.payload.aiReviews);
      state.ticksAdvanced += 1;
    });
    builder.addCase(runHourlyTick.rejected, (state, action) => {
      advanceClock(state);
      state.ai.lastSource = 'fallback';
      state.ai.lastFeature = 'tick';
      state.ai.lastError = action.error.message || 'Tick failed; advanced clock only.';
      state.ai.fallbackCount += 1;
    });
  }
});

export const { resetGame, hydrateGame, setSpeed, selectBuild, selectTile, placeSelectedBuild, adjustPrice, markSaved } =
  gameSlice.actions;

export function previewNextHour(game: GameState): { day: number; hour: number } {
  const hour = game.hour + 1;
  return hour >= 24 ? { day: game.day + 1, hour: 0 } : { day: game.day, hour };
}

function advanceClock(state: GameState): void {
  state.hour += 1;
  if (state.hour >= 24) {
    state.hour = 0;
    state.day += 1;
    state.season = seasonForDay(state.day);
  }
}

function startNewDay(state: GameState): void {
  const roll = Math.random();
  state.weather = roll < 0.38 ? 'sunny' : roll < 0.6 ? 'cloudy' : roll < 0.78 ? 'rain' : roll < 0.88 ? 'chilly' : roll < 0.96 ? 'heatwave' : 'storm';
  const seasonModifier = state.season === 'summer' ? 1.45 : state.season === 'autumn' ? 0.82 : state.season === 'winter' ? 0.48 : 1;
  const weatherModifier = state.weather === 'storm' ? 0.35 : state.weather === 'rain' ? 0.68 : 1;
  state.demand = Math.round(seasonModifier * weatherModifier * (0.55 + state.reputation / 5) * 100) / 100;
  state.lastEvent = `Day ${state.day}: ${state.season}, ${state.weather}. Demand ${state.demand.toFixed(2)}x.`;
}

function processArrivals(
  state: GameState,
  tourists: Array<AiResult<TouristState>>,
  decisions: Array<{ touristId: string; result: AiResult<PlotDecision> }>
): void {
  if (tourists.length === 0) {
    state.lastEvent = 'Tourists arrived, but no plots were available.';
    return;
  }
  for (const result of tourists) {
    const tourist = result.value;
    const decision = decisions.find((candidate) => candidate.touristId === tourist.id)?.result;
    if (decision) recordAi(state, decision);
    state.tourists.push(tourist);
    const selectedPlotId = decision?.value.selectedPlotId;
    const plot = selectedPlotId ? state.structures.find((structure) => structure.id === selectedPlotId && !structure.isOccupied) : undefined;
    if (decision?.value.stay && plot) {
      plot.isOccupied = true;
      plot.touristId = tourist.id;
      tourist.state = 'staying';
      tourist.plotId = plot.id;
      tourist.lastReason = decision.value.reason;
      state.lastEvent = `${tourist.name} checked into ${buildables[plot.type].name}.`;
    } else {
      tourist.state = 'leftWithoutStaying';
      tourist.lastReason = decision?.value.reason || 'No acceptable plot was available.';
    }
  }
}

function updateSatisfaction(state: GameState): void {
  for (const tourist of state.tourists.filter((candidate) => candidate.state === 'staying')) {
    const plot = state.structures.find((structure) => structure.id === tourist.plotId);
    if (!plot) continue;
    let delta = state.weather === 'sunny' ? 1.2 : state.weather === 'cloudy' ? 0.2 : state.weather === 'rain' ? -1.8 : state.weather === 'storm' ? -4.5 : -1.2;
    delta += facilityScore(state, plot, tourist.preferences.likesFacilities) / 12;
    delta -= crowdingPenalty(state, plot);
    if (priceFor(state, plot.type) > tourist.budget) delta -= 2.5;
    tourist.satisfaction = clamp(tourist.satisfaction + delta, 0, 100);
  }
}

function billRevenue(state: GameState): void {
  for (const plot of state.structures.filter((structure) => structure.isOccupied && buildables[structure.type].isPlot)) {
    const price = priceFor(state, plot.type);
    state.money += price;
    addLedger(state, 'revenue', `${buildables[plot.type].name} nightly stay`, price);
    const tourist = state.tourists.find((candidate) => candidate.id === plot.touristId);
    if (tourist) tourist.nightsStayed += 1;
  }
  state.lastEvent = 'Nightly plot revenue collected.';
}

function chargeMaintenance(state: GameState): void {
  const total = state.structures.reduce((sum, structure) => sum + buildables[structure.type].maintenanceCost, 0);
  if (total > 0) {
    state.money -= total;
    addLedger(state, 'maintenance', 'Daily campground maintenance', -total);
  }
  state.lastEvent = `Maintenance charged: $${total}.`;
}

function processDepartures(
  state: GameState,
  reviews: Array<{ touristId: string; result: AiResult<Review> }>
): void {
  for (const tourist of state.tourists.filter(
    (candidate) => candidate.state === 'staying' && candidate.nightsStayed >= candidate.stayNights
  )) {
    const plot = state.structures.find((structure) => structure.id === tourist.plotId);
    if (plot) {
      plot.isOccupied = false;
      plot.touristId = undefined;
    }
    tourist.state = 'departed';
    const result = reviews.find((candidate) => candidate.touristId === tourist.id)?.result ?? {
      value: generateFallbackReview(state, tourist),
      source: 'fallback' as const,
      feature: 'review',
      error: 'Fallback review used during departure.'
    };
    recordAi(state, result);
    state.reviews.push(result.value);
    trimFeed(state.reviews, 60);
    recalculateReputation(state);
    state.lastEvent = `${tourist.name} departed and left a ${result.value.stars}-star review.`;
  }
}

function recordAi<T>(state: GameState, result: AiResult<T>): void {
  state.ai.lastSource = result.source;
  state.ai.lastFeature = result.feature;
  state.ai.lastError = result.error;
  if (result.source === 'local') state.ai.successCount += 1;
  else state.ai.fallbackCount += 1;
}

function addLedger(state: GameState, kind: EconomyEntry['kind'], description: string, amount: number): void {
  state.ledger.push({ id: makeId('ledger'), day: state.day, hour: state.hour, kind, description, amount });
  trimFeed(state.ledger, 120);
}

function recalculateReputation(state: GameState): void {
  if (state.reviews.length === 0) return;
  const average = state.reviews.reduce((sum, review) => sum + review.stars, 0) / state.reviews.length;
  state.reputation = clamp(state.reputation * 0.72 + average * 0.28, 1, 5);
}

function seasonForDay(day: number): SeasonType {
  const index = Math.floor((day - 1) / 28) % 4;
  return index === 0 ? 'spring' : index === 1 ? 'summer' : index === 2 ? 'autumn' : 'winter';
}

function trimFeed<T>(feed: T[], max: number): void {
  if (feed.length > max) feed.splice(0, feed.length - max);
}
