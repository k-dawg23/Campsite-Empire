import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { App, IsometricMap } from '../src/ui/App';
import { createNewGame } from '../src/features/simulation/newGame';
import { gameSlice } from '../src/features/simulation/gameSlice';
import type { GameState } from '../src/features/simulation/types';

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
  it('renders the playable management view first', async () => {
    renderApp();
    expect(await screen.findByText('Campsite Empire')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('AI Status')).toBeInTheDocument();
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
