import { createSelector } from '@reduxjs/toolkit';
import { buildables } from './buildables';
import type { GameState, StructureType } from './types';

export interface RootLike {
  game: GameState;
}

export const selectGame = (state: RootLike) => state.game;
export const selectTiles = createSelector(selectGame, (game) => game.tiles);
export const selectStructures = createSelector(selectGame, (game) => game.structures);
export const selectTourists = createSelector(selectGame, (game) => game.tourists);
export const selectReviews = createSelector(selectGame, (game) => game.reviews);
export const selectChatter = createSelector(selectGame, (game) => game.chatter);
export const selectLedger = createSelector(selectGame, (game) => game.ledger);
export const selectAiStatus = createSelector(selectGame, (game) => game.ai);

export const selectPlots = createSelector(selectStructures, (structures) =>
  structures.filter((structure) => buildables[structure.type].isPlot)
);

export const selectAvailablePlots = createSelector(selectPlots, (plots) =>
  plots.filter((plot) => !plot.isOccupied)
);

export const selectOccupancy = createSelector(selectPlots, (plots) => ({
  occupied: plots.filter((plot) => plot.isOccupied).length,
  total: plots.length
}));

export const selectVisibleFeed = createSelector(
  selectChatter,
  selectReviews,
  selectLedger,
  (chatter, reviews, ledger) => ({
    chatter: chatter.slice(-8),
    reviews: reviews.slice(-5),
    ledger: ledger.slice(-6)
  })
);

export function priceFor(game: GameState, type: StructureType): number {
  if (type === 'tentSite') return game.pricing.tentSite;
  if (type === 'campervanSpot') return game.pricing.campervanSpot;
  if (type === 'rvHookup') return game.pricing.rvHookup;
  return 0;
}
