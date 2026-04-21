import { clamp } from '../../lib/random';
import { buildables } from '../simulation/buildables';
import type { Chatter, GameState, PlotDecision, Review, StructureType, TouristState } from '../simulation/types';
import {
  asRecord,
  parseFirstJsonObject,
  readBoolean,
  readNumber,
  readString,
  readStringArray
} from './json';
import {
  generateFallbackChatter,
  generateFallbackReview,
  generateFallbackTourist,
  safeStars
} from './fallbacks';

export interface AiResult<T> {
  value: T;
  source: 'local' | 'fallback';
  feature: string;
  error?: string;
}

export interface AiConfig {
  provider: string;
  url: string;
  model: string;
  timeoutMs: number;
}

export function getAiConfig(): AiConfig {
  return {
    provider: import.meta.env.VITE_CAMPSITE_AI_PROVIDER || '',
    url: import.meta.env.VITE_CAMPSITE_AI_URL || 'http://localhost:11434/api/generate',
    model: import.meta.env.VITE_CAMPSITE_AI_MODEL || 'llama3.1',
    timeoutMs: readTimeout(import.meta.env.VITE_CAMPSITE_AI_TIMEOUT_MS)
  };
}

export async function generateTouristWithAi(game: GameState): Promise<AiResult<TouristState>> {
  const fallback = generateFallbackTourist();
  const prompt = `Return one JSON object only with schema:
{"name":"string","personality":"string","budget":number,"preferred_plot":"tentSite|campervanSpot|rvHookup","likes_facilities":["restroom"],"dislikes_nearby":["playground"],"likes_quiet":boolean,"likes_water":boolean,"stay_nights":number}
Create a plausible campground tourist for weather ${game.weather}, season ${game.season}, reputation ${game.reputation}.`;
  const response = await askLocalJson(prompt);
  const record = asRecord(response.object);
  if (!record) return { value: fallback, source: 'fallback', feature: 'tourist', error: response.error || 'No valid JSON object returned.' };

  const preferredPlot = normalizeStructure(readString(record, 'preferred_plot', fallback.preferences.preferredPlot));
  if (!buildables[preferredPlot].isPlot) {
    return { value: fallback, source: 'fallback', feature: 'tourist', error: 'Tourist preferred_plot was not a plot type.' };
  }
  return {
    value: {
      ...fallback,
      name: readString(record, 'name', fallback.name, 40),
      personality: readString(record, 'personality', fallback.personality, 60),
      budget: clamp(readNumber(record, 'budget', fallback.budget), 5, 250),
      stayNights: Math.round(clamp(readNumber(record, 'stay_nights', fallback.stayNights), 1, 7)),
      preferences: {
        preferredPlot,
        likesFacilities: normalizeFacilities(readStringArray(record, 'likes_facilities')),
        dislikesNearby: normalizeFacilities(readStringArray(record, 'dislikes_nearby')),
        likesQuiet: readBoolean(record, 'likes_quiet', fallback.preferences.likesQuiet),
        likesWater: readBoolean(record, 'likes_water', fallback.preferences.likesWater)
      }
    },
    source: 'local',
    feature: 'tourist'
  };
}

export async function selectPlotWithAi(
  tourist: TouristState,
  decision: PlotDecision
): Promise<AiResult<PlotDecision>> {
  const prompt = `Return one JSON object only with schema:
{"stay":boolean,"selected_plot_id":"guid-or-null","reason":"string"}
Tourist: ${tourist.name}, budget ${tourist.budget}, personality ${tourist.personality}.
Ranked plots: ${JSON.stringify(decision.rankedPlots)}
Choose whether the tourist stays.`;
  const response = await askLocalJson(prompt);
  const record = asRecord(response.object);
  if (!record) return { value: decision, source: 'fallback', feature: 'plot-selection', error: response.error || 'No valid JSON object returned.' };

  const stay = readBoolean(record, 'stay', decision.stay);
  const selected = readString(record, 'selected_plot_id', decision.selectedPlotId || '', 80);
  const selectedPlotId = decision.rankedPlots.some((plot) => plot.plotId === selected) ? selected : decision.selectedPlotId;
  return {
    value: {
      ...decision,
      stay,
      selectedPlotId: stay ? selectedPlotId : undefined,
      reason: readString(record, 'reason', decision.reason, 160)
    },
    source: 'local',
    feature: 'plot-selection'
  };
}

export async function generateChatterWithAi(game: GameState, tourist: TouristState): Promise<AiResult<Chatter>> {
  const fallback = generateFallbackChatter(game, tourist);
  const prompt = `Return one JSON object only with schema:
{"mood":"string","text":"string"}
Write short campground guest chatter for ${tourist.name}. Satisfaction ${tourist.satisfaction}, weather ${game.weather}.`;
  const response = await askLocalJson(prompt);
  const record = asRecord(response.object);
  if (!record) return { value: fallback, source: 'fallback', feature: 'chatter', error: response.error || 'No valid JSON object returned.' };

  return {
    value: {
      ...fallback,
      mood: readString(record, 'mood', fallback.mood, 24),
      text: `${tourist.name}: ${readString(record, 'text', fallback.text, 160)}`
    },
    source: 'local',
    feature: 'chatter'
  };
}

export async function generateReviewWithAi(game: GameState, tourist: TouristState): Promise<AiResult<Review>> {
  const fallback = generateFallbackReview(game, tourist);
  const prompt = `Return one JSON object only with schema:
{"stars":1,"text":"string","tags":["string"]}
Write a campground review for ${tourist.name}. Satisfaction ${tourist.satisfaction}.`;
  const response = await askLocalJson(prompt);
  const record = asRecord(response.object);
  if (!record) return { value: fallback, source: 'fallback', feature: 'review', error: response.error || 'No valid JSON object returned.' };

  return {
    value: {
      ...fallback,
      stars: safeStars(readNumber(record, 'stars', fallback.stars)),
      text: readString(record, 'text', fallback.text, 240),
      tags: readStringArray(record, 'tags').slice(0, 4)
    },
    source: 'local',
    feature: 'review'
  };
}

interface LocalJsonResponse {
  object?: unknown;
  error?: string;
}

async function askLocalJson(prompt: string): Promise<LocalJsonResponse> {
  const config = getAiConfig();
  if (!config.provider.trim()) return { error: 'No local AI provider configured; template fallback used.' };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const body = buildPayload(config, prompt);
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        error: `Local AI returned HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}${detail ? `: ${detail.slice(0, 180)}` : ''}`
      };
    }
    const text = await response.text();
    const object = parseFirstJsonObject(extractProviderText(text));
    return object ? { object } : { error: 'Local AI response did not contain a valid JSON object.' };
  } catch (error) {
    return { error: describeFetchError(error, config) };
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildPayload(config: AiConfig, prompt: string): unknown {
  if (config.provider.toLowerCase() === 'ollama') {
    return { model: config.model, prompt, stream: false, format: 'json' };
  }
  return {
    model: config.model,
    stream: false,
    temperature: 0.7,
    messages: [
      { role: 'system', content: 'Return exactly one valid JSON object and no markdown.' },
      { role: 'user', content: prompt }
    ]
  };
}

function extractProviderText(body: string): string {
  const object = parseFirstJsonObject(body);
  const record = asRecord(object);
  if (!record) return body;
  if (typeof record.response === 'string') return record.response;
  if (typeof record.content === 'string') return record.content;
  const choices = record.choices;
  if (Array.isArray(choices)) {
    const first = asRecord(choices[0]);
    const message = first ? asRecord(first.message) : undefined;
    if (message && typeof message.content === 'string') return message.content;
    if (first && typeof first.text === 'string') return first.text;
  }
  return body;
}

function normalizeStructure(value: string): StructureType {
  const cleaned = value.trim();
  if (cleaned in buildables) return cleaned as StructureType;
  const camel = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return camel in buildables ? (camel as StructureType) : 'tentSite';
}

function normalizeFacilities(values: string[]): StructureType[] {
  return values
    .map(normalizeStructure)
    .filter((type) => !buildables[type].isPlot)
    .slice(0, 4);
}

function readTimeout(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1000 ? Math.min(parsed, 120000) : 30000;
}

function describeFetchError(error: unknown, config: AiConfig): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return `Local AI request timed out after ${Math.round(config.timeoutMs / 1000)}s. The model may still be loading or generating.`;
  }
  if (error instanceof TypeError) {
    return `Local AI request failed. Check that ${config.url} is running and allows browser CORS requests.`;
  }
  if (error instanceof Error && error.message.trim()) {
    return `Local AI request failed: ${error.message}`;
  }
  return 'Local AI request failed for an unknown reason.';
}
