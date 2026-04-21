import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { store } from '../src/app/store';
import { App, IsometricMap } from '../src/ui/App';
import { createNewGame } from '../src/features/simulation/newGame';

describe('App UI', () => {
  it('renders the playable management view first', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(await screen.findByText('Campsite Empire')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('AI Status')).toBeInTheDocument();
  });

  it('shows build costs instead of nightly prices in the build panel', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(await screen.findByRole('button', { name: /Tent Site \$90/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Campervan Spot \$180/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RV Hookup \$300/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tent Site \$22\/night/ })).not.toBeInTheDocument();
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
      <Provider store={store}>
        <IsometricMap game={game} hoveredTile={undefined} onHover={() => undefined} />
      </Provider>
    );

    expect(screen.getByLabelText('Tent Site occupied visual')).toBeInTheDocument();
    expect(screen.getByLabelText('Campervan Spot vacant visual')).toBeInTheDocument();
    expect(screen.getByLabelText('occupied guest marker')).toBeInTheDocument();
  });
});
