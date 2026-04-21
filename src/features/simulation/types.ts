export const mapSize = 16;
export const saveSchemaVersion = 2;

export type TerrainType = 'grass' | 'water' | 'trees' | 'path' | 'sand';

export type StructureType =
  | 'tentSite'
  | 'campervanSpot'
  | 'rvHookup'
  | 'restroom'
  | 'shower'
  | 'firePit'
  | 'playground'
  | 'campStore';

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'heatwave' | 'chilly';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type TouristLifecycle = 'arriving' | 'staying' | 'departed' | 'leftWithoutStaying';
export type Speed = 0 | 1 | 2 | 5;

export interface TileState {
  x: number;
  y: number;
  terrain: TerrainType;
  structureId?: string;
}

export interface BuildableDefinition {
  type: StructureType;
  name: string;
  symbol: string;
  isPlot: boolean;
  buildCost: number;
  maintenanceCost: number;
  basePrice: number;
  allowedTerrain: TerrainType[];
  preferredNearby: StructureType[];
}

export interface StructureState {
  id: string;
  type: StructureType;
  x: number;
  y: number;
  isOccupied: boolean;
  touristId?: string;
}

export interface TouristPreferences {
  preferredPlot: StructureType;
  likesFacilities: StructureType[];
  dislikesNearby: StructureType[];
  likesQuiet: boolean;
  likesWater: boolean;
}

export interface TouristState {
  id: string;
  name: string;
  personality: string;
  budget: number;
  preferences: TouristPreferences;
  stayNights: number;
  nightsStayed: number;
  satisfaction: number;
  state: TouristLifecycle;
  plotId?: string;
  lastReason: string;
}

export interface Review {
  id: string;
  touristId: string;
  day: number;
  stars: number;
  text: string;
  tags: string[];
}

export interface Chatter {
  id: string;
  touristId: string;
  day: number;
  hour: number;
  mood: string;
  text: string;
}

export interface EconomyEntry {
  id: string;
  day: number;
  hour: number;
  kind: 'build' | 'revenue' | 'maintenance' | 'adjustment';
  description: string;
  amount: number;
}

export interface PricingState {
  tentSite: number;
  campervanSpot: number;
  rvHookup: number;
}

export interface AiStatus {
  provider: string;
  model: string;
  url: string;
  lastSource: 'local' | 'fallback' | 'none';
  lastFeature: string;
  lastError?: string;
  successCount: number;
  fallbackCount: number;
}

export interface SelectedTile {
  x: number;
  y: number;
}

export interface GameState {
  version: string;
  saveSchemaVersion: number;
  day: number;
  hour: number;
  season: SeasonType;
  weather: WeatherType;
  money: number;
  reputation: number;
  demand: number;
  speed: Speed;
  ticksAdvanced: number;
  selectedBuild: StructureType;
  selectedTile?: SelectedTile;
  lastEvent: string;
  pricing: PricingState;
  tiles: TileState[];
  structures: StructureState[];
  tourists: TouristState[];
  reviews: Review[];
  chatter: Chatter[];
  ledger: EconomyEntry[];
  ai: AiStatus;
  lastSavedAt?: string;
}

export interface PlotScore {
  plotId: string;
  score: number;
  reason: string;
}

export interface PlotDecision {
  selectedPlotId?: string;
  stay: boolean;
  reason: string;
  rankedPlots: PlotScore[];
}
