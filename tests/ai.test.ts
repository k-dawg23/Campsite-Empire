import { describe, expect, it } from 'vitest';
import { generateFallbackReview, generateFallbackTourist, safeStars } from '../src/features/ai/fallbacks';
import { parseFirstJsonObject, readString } from '../src/features/ai/json';
import { createNewGame } from '../src/features/simulation/newGame';

describe('AI JSON and fallback behavior', () => {
  it('extracts the first complete JSON object from noisy text', () => {
    expect(parseFirstJsonObject('noise {"stars":5,"text":"Great"} tail')).toEqual({
      stars: 5,
      text: 'Great'
    });
  });

  it('falls back safely for missing string fields and clamps stars', () => {
    expect(readString({ text: '' }, 'text', 'fallback')).toBe('fallback');
    expect(safeStars(9)).toBe(5);
    expect(safeStars(-2)).toBe(1);
  });

  it('creates valid template tourists and reviews', () => {
    const game = createNewGame();
    const tourist = generateFallbackTourist();
    const review = generateFallbackReview(game, tourist);
    expect(tourist.name.length).toBeGreaterThan(0);
    expect(review.stars).toBeGreaterThanOrEqual(1);
    expect(review.stars).toBeLessThanOrEqual(5);
  });
});
