import { choice, clamp, makeId } from '../../lib/random';
import { buildables } from '../simulation/buildables';
import type { Chatter, GameState, PlotDecision, Review, StructureType, TouristState } from '../simulation/types';

const names = ['Mara', 'Eli', 'Jules', 'Nora', 'Theo', 'Sam', 'Iris', 'Cal', 'Rina', 'Owen'];
const personalities = [
  'quiet stargazer',
  'budget backpacker',
  'family planner',
  'comfort seeker',
  'campfire storyteller',
  'weekend explorer'
];

export function generateFallbackTourist(): TouristState {
  const preferredPlot = choice<StructureType>(['tentSite', 'campervanSpot', 'rvHookup']);
  const personality = choice(personalities);
  const likesQuiet = personality.includes('quiet');
  const budget =
    preferredPlot === 'tentSite'
      ? 18 + Math.floor(Math.random() * 24)
      : preferredPlot === 'campervanSpot'
        ? 34 + Math.floor(Math.random() * 36)
        : 48 + Math.floor(Math.random() * 48);

  return {
    id: makeId('tourist'),
    name: `${choice(names)} ${10 + Math.floor(Math.random() * 90)}`,
    personality,
    budget,
    preferences: {
      preferredPlot,
      likesFacilities: [...buildables[preferredPlot].preferredNearby],
      dislikesNearby: likesQuiet ? ['playground', 'campStore'] : [],
      likesQuiet,
      likesWater: Math.random() < 0.4
    },
    stayNights: 1 + Math.floor(Math.random() * 3),
    nightsStayed: 0,
    satisfaction: 62 + Math.floor(Math.random() * 22),
    state: 'arriving',
    lastReason: ''
  };
}

export function generateFallbackChatter(game: GameState, tourist: TouristState): Chatter {
  const mood =
    tourist.satisfaction >= 82
      ? 'delighted'
      : tourist.satisfaction >= 62
        ? 'content'
        : tourist.satisfaction >= 42
          ? 'uneasy'
          : 'unhappy';
  const text =
    mood === 'delighted'
      ? 'This place has the makings of a yearly tradition.'
      : mood === 'content'
        ? 'Nice setup. I can get to what I need without a hike.'
        : mood === 'uneasy'
          ? 'The campground is okay, but a few comforts would help.'
          : 'I am counting the hours until checkout.';
  return {
    id: makeId('chatter'),
    touristId: tourist.id,
    day: game.day,
    hour: game.hour,
    mood,
    text: `${tourist.name}: ${text}`
  };
}

export function generateFallbackReview(game: GameState, tourist: TouristState): Review {
  const stars =
    tourist.satisfaction >= 86
      ? 5
      : tourist.satisfaction >= 70
        ? 4
        : tourist.satisfaction >= 52
          ? 3
          : tourist.satisfaction >= 34
            ? 2
            : 1;
  const text =
    stars === 5
      ? 'Beautiful campground, fair pricing, and the facilities were exactly where I needed them.'
      : stars === 4
        ? 'A relaxing stay with good value. A little more polish and it would be perfect.'
        : stars === 3
          ? 'Decent campsite, but the comfort depended a lot on weather and nearby amenities.'
          : stars === 2
            ? 'The basics were there, though the price and comfort did not quite line up.'
            : 'I left disappointed. Better facilities and quieter plots would make a big difference.';
  return {
    id: makeId('review'),
    touristId: tourist.id,
    day: game.day,
    stars,
    text,
    tags: stars >= 4 ? ['value', 'facilities'] : ['comfort', 'pricing']
  };
}

export function fallbackPlotDecision(decision: PlotDecision): PlotDecision {
  const best = decision.rankedPlots[0];
  return {
    ...decision,
    stay: Boolean(best && best.score >= 58),
    selectedPlotId: best && best.score >= 58 ? best.plotId : undefined,
    reason: best && best.score >= 58 ? 'Best available plot matches the guest.' : 'No plot cleared the comfort and value threshold.'
  };
}

export function safeStars(stars: number): number {
  return Math.round(clamp(stars, 1, 5));
}
