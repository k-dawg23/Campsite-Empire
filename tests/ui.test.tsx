import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App, IsometricMap, tutorialSeenKey } from '../src/ui/App';
import { createNewGame } from '../src/features/simulation/newGame';
import { gameSlice, resetGame } from '../src/features/simulation/gameSlice';
import type { GameState } from '../src/features/simulation/types';
import { clearSavedGame, loadGameState, saveGameState } from '../src/features/save/indexedDb';
import { saveSpeedPreference, speedPreferenceKey } from '../src/features/save/speedPreference';

function renderApp(preloadedGame?: GameState) {
  const game = preloadedGame ?? createNewGame();
  const testStore = configureStore({
    reducer: {
      game: gameSlice.reducer
    },
    preloadedState: {
      game
    }
  });
  render(
    <Provider store={testStore}>
      <App />
    </Provider>
  );
  return testStore;
}

describe('App UI', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearSavedGame();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the playable management view first', async () => {
    renderApp();
    expect(await screen.findByText('Campsite Empire')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('AI Status')).toBeInTheDocument();
  });

  it('keeps version and stack details out of the player-facing header', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Campsite Empire' })).toBeInTheDocument();
    expect(screen.queryByText(/React \+ TypeScript \+ Redux/)).not.toBeInTheDocument();
    expect(screen.queryByText(/v2\.0\.4/)).not.toBeInTheDocument();
  });

  it('shows the tutorial on first visit with step controls and progress', async () => {
    renderApp();

    expect(await screen.findByRole('dialog', { name: 'Grow a campground people love' })).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    expect(screen.getByText(/turning a quiet grid of land into a profitable campground/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('advances through tutorial topics and updates progress', async () => {
    renderApp();
    expect(await screen.findByRole('dialog', { name: 'Grow a campground people love' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Build plots and facilities' })).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Tourists choose where to stay' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Set prices with care' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Watch weather and seasons' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Local AI adds personality' })).toBeInTheDocument();
    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem(tutorialSeenKey)).toBe('true');
  });

  it('persists skipped tutorial state and does not reopen automatically', async () => {
    renderApp();
    expect(await screen.findByRole('dialog', { name: 'Grow a campground people love' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));

    expect(localStorage.getItem(tutorialSeenKey)).toBe('true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    cleanup();
    renderApp();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reopens the tutorial from Help after it has been seen', async () => {
    localStorage.setItem(tutorialSeenKey, 'true');
    renderApp();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Help' }));

    expect(screen.getByRole('dialog', { name: 'Grow a campground people love' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows build costs instead of nightly prices in the build panel', async () => {
    renderApp();
    expect(await screen.findByRole('button', { name: /Tent Site \$90/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Campervan Spot \$180/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RV Hookup \$300/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tent Site \$22\/night/ })).not.toBeInTheDocument();
  });

  it('disables unaffordable build items and keeps affordable items selectable', async () => {
    const game = createNewGame();
    game.money = 100;
    game.selectedBuild = 'tentSite';
    const testStore = renderApp(game);

    const tentSite = await screen.findByRole('button', { name: /Tent Site \$90/ });
    const campervan = screen.getByRole('button', { name: /Campervan Spot \$180/ });
    const firePit = screen.getByRole('button', { name: /Fire Pit \$80/ });

    expect(tentSite).toBeEnabled();
    expect(firePit).toBeEnabled();
    expect(campervan).toBeDisabled();
    expect(campervan).toHaveClass('cursor-not-allowed');

    fireEvent.click(campervan);
    expect(testStore.getState().game.selectedBuild).toBe('tentSite');

    fireEvent.click(firePit);
    expect(testStore.getState().game.selectedBuild).toBe('firePit');
  });

  it('restores IndexedDB saves while keeping speed from localStorage', async () => {
    const saved = createNewGame();
    saved.money = 777;
    saved.speed = 1;
    await saveGameState(saved);
    saveSpeedPreference(5);

    const testStore = renderApp();

    await waitFor(() => expect(testStore.getState().game.money).toBe(777));
    expect(testStore.getState().game.speed).toBe(5);
  });

  it('autosaves changed game state after 2 seconds', async () => {
    const game = createNewGame();
    game.money = 432;
    game.speed = 0;
    renderApp(game);
    expect(await screen.findByText('No saved campground found.')).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 2300));
    });

    await waitFor(async () => {
      const saved = await loadGameState();
      expect(saved?.money).toBe(432);
    });
  });

  it('supports manual Save, Load, and double-confirmed New Game', async () => {
    const saved = createNewGame();
    saved.money = 777;
    await saveGameState(saved);

    const testStore = renderApp();
    await waitFor(() => expect(testStore.getState().game.money).toBe(777));

    act(() => {
      testStore.dispatch(resetGame());
    });
    expect(testStore.getState().game.money).toBe(1800);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    });
    await waitFor(() => expect(testStore.getState().game.money).toBe(777));
    expect(await screen.findByText(/Loaded at/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(await screen.findByText(/Saved at/)).toBeInTheDocument();

    saveSpeedPreference(5);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
    });
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(testStore.getState().game.money).toBe(777);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    });
    await waitFor(() => expect(testStore.getState().game.money).toBe(1800));
    expect(localStorage.getItem(speedPreferenceKey)).toBeNull();
    expect(await loadGameState()).toBeUndefined();
  });

  it('renders structure imagery and occupied plot state on the map', () => {
    const game = createNewGame();
    const plot = game.structures.find((structure) => structure.type === 'tentSite')!;
    plot.isOccupied = true;
    plot.touristId = 'tourist-occupied';
    game.tourists.push({
      id: 'tourist-occupied',
      name: 'Map Guest',
      personality: 'visual tester',
      budget: 50,
      preferences: {
        preferredPlot: 'tentSite',
        likesFacilities: [],
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
    });

    render(
      <Provider store={configureStore({ reducer: { game: gameSlice.reducer }, preloadedState: { game } })}>
        <IsometricMap game={game} hoveredTile={undefined} onHover={() => undefined} />
      </Provider>
    );

    const occupiedStructure = screen.getByLabelText('Tent Site occupied visual');
    const occupiedMarker = screen.getByTestId('occupied-marker-tentSite');
    expect(occupiedStructure).toBeInTheDocument();
    expect(screen.getByLabelText('Campervan Spot vacant visual')).toBeInTheDocument();
    expect(screen.getByLabelText('occupied guest marker')).toBe(occupiedMarker);
    expect(within(occupiedStructure).getByTestId('occupied-marker-tentSite')).toBe(occupiedMarker);
    expect(occupiedStructure.lastElementChild).toBe(occupiedMarker);
  });
});
