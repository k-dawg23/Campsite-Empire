import type { BuildableDefinition, StructureType } from './types';

export const buildables: Record<StructureType, BuildableDefinition> = {
  tentSite: {
    type: 'tentSite',
    name: 'Tent Site',
    symbol: 'T',
    isPlot: true,
    buildCost: 90,
    maintenanceCost: 2,
    basePrice: 22,
    allowedTerrain: ['grass', 'sand'],
    preferredNearby: ['restroom', 'firePit']
  },
  campervanSpot: {
    type: 'campervanSpot',
    name: 'Campervan Spot',
    symbol: 'V',
    isPlot: true,
    buildCost: 180,
    maintenanceCost: 4,
    basePrice: 38,
    allowedTerrain: ['grass', 'path', 'sand'],
    preferredNearby: ['shower', 'campStore']
  },
  rvHookup: {
    type: 'rvHookup',
    name: 'RV Hookup',
    symbol: 'RV',
    isPlot: true,
    buildCost: 300,
    maintenanceCost: 7,
    basePrice: 54,
    allowedTerrain: ['grass', 'path'],
    preferredNearby: ['shower', 'campStore', 'restroom']
  },
  restroom: {
    type: 'restroom',
    name: 'Restroom',
    symbol: 'WC',
    isPlot: false,
    buildCost: 260,
    maintenanceCost: 9,
    basePrice: 0,
    allowedTerrain: ['grass', 'path', 'sand'],
    preferredNearby: []
  },
  shower: {
    type: 'shower',
    name: 'Showers',
    symbol: 'SH',
    isPlot: false,
    buildCost: 340,
    maintenanceCost: 12,
    basePrice: 0,
    allowedTerrain: ['grass', 'path'],
    preferredNearby: []
  },
  firePit: {
    type: 'firePit',
    name: 'Fire Pit',
    symbol: 'FP',
    isPlot: false,
    buildCost: 80,
    maintenanceCost: 1,
    basePrice: 0,
    allowedTerrain: ['grass', 'sand'],
    preferredNearby: []
  },
  playground: {
    type: 'playground',
    name: 'Playground',
    symbol: 'PG',
    isPlot: false,
    buildCost: 210,
    maintenanceCost: 5,
    basePrice: 0,
    allowedTerrain: ['grass', 'sand'],
    preferredNearby: []
  },
  campStore: {
    type: 'campStore',
    name: 'Camp Store',
    symbol: 'ST',
    isPlot: false,
    buildCost: 520,
    maintenanceCost: 16,
    basePrice: 0,
    allowedTerrain: ['grass', 'path'],
    preferredNearby: []
  }
};

export const buildableOrder: StructureType[] = [
  'tentSite',
  'campervanSpot',
  'rvHookup',
  'restroom',
  'shower',
  'firePit',
  'playground',
  'campStore'
];

export const plotTypes: StructureType[] = ['tentSite', 'campervanSpot', 'rvHookup'];
