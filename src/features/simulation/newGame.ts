import { makeId } from '../../lib/random';
import { buildables } from './buildables';
import type { GameState, StructureState, StructureType, TerrainType, TileState } from './types';
import { mapSize, saveSchemaVersion } from './types';

export function createInitialTiles(): TileState[] {
  const tiles: TileState[] = [];
  for (let y = 0; y < mapSize; y += 1) {
    for (let x = 0; x < mapSize; x += 1) {
      let terrain: TerrainType = 'grass';
      if (x < 3 && y > 10) terrain = 'water';
      else if (x > 11 && y < 5) terrain = 'trees';
      else if (y === 7 || x === 7) terrain = 'path';
      else if (x < 5 && y < 4) terrain = 'sand';
      else if ((x + y) % 13 === 0) terrain = 'trees';
      tiles.push({ x, y, terrain });
    }
  }
  return tiles;
}

export function createNewGame(): GameState {
  const state: GameState = {
    version: '2.0.1',
    saveSchemaVersion,
    day: 1,
    hour: 6,
    season: 'spring',
    weather: 'sunny',
    money: 1800,
    reputation: 3.4,
    demand: 1,
    speed: 1,
    ticksAdvanced: 0,
    selectedBuild: 'tentSite',
    lastEvent: 'Campsite Empire v2.0.0 is running at 1x.',
    pricing: {
      tentSite: 22,
      campervanSpot: 38,
      rvHookup: 54
    },
    tiles: createInitialTiles(),
    structures: [],
    tourists: [],
    reviews: [],
    chatter: [],
    ledger: [],
    ai: {
      provider: import.meta.env.VITE_CAMPSITE_AI_PROVIDER || '',
      model: import.meta.env.VITE_CAMPSITE_AI_MODEL || 'llama3.1',
      url: import.meta.env.VITE_CAMPSITE_AI_URL || 'http://localhost:11434/api/generate',
      lastSource: 'none',
      lastFeature: '',
      successCount: 0,
      fallbackCount: 0
    }
  };

  placeStarter(state, 'tentSite', 5, 6);
  placeStarter(state, 'tentSite', 6, 6);
  placeStarter(state, 'campervanSpot', 8, 6);
  placeStarter(state, 'restroom', 7, 8);
  placeStarter(state, 'firePit', 6, 8);
  placeStarter(state, 'campStore', 8, 8);
  return state;
}

function placeStarter(state: GameState, type: StructureType, x: number, y: number): void {
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
}

export function canPlaceStructure(state: GameState, type: StructureType, x: number, y: number): string | true {
  const tile = state.tiles.find((candidate) => candidate.x === x && candidate.y === y);
  const definition = buildables[type];
  if (!tile) return 'That tile is outside the campground.';
  if (tile.structureId || state.structures.some((structure) => structure.x === x && structure.y === y)) {
    return 'That tile is already occupied.';
  }
  if (!definition.allowedTerrain.includes(tile.terrain)) {
    return `${definition.name} cannot be placed on ${tile.terrain}.`;
  }
  if (state.money < definition.buildCost) {
    return `Not enough money for ${definition.name}.`;
  }
  return true;
}
