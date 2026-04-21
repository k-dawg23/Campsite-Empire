import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clearSavedGame, loadGameState, saveGameState } from '../src/features/save/indexedDb';
import { clearSpeedPreference, loadSpeedPreference, saveSpeedPreference, speedPreferenceKey } from '../src/features/save/speedPreference';
import { createNewGame } from '../src/features/simulation/newGame';

describe('IndexedDB persistence', () => {
  it('round-trips full game state', async () => {
    await clearSavedGame();
    const state = createNewGame();
    state.money = 1234;
    await saveGameState(state);
    const loaded = await loadGameState();
    expect(loaded?.money).toBe(1234);
    expect(loaded?.tiles.length).toBe(256);
  });

  it('stores game speed separately in localStorage', () => {
    clearSpeedPreference();
    saveSpeedPreference(5);
    expect(localStorage.getItem(speedPreferenceKey)).toBe('5');
    expect(loadSpeedPreference()).toBe(5);
    clearSpeedPreference();
    expect(loadSpeedPreference()).toBeUndefined();
  });
});
