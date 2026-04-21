import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { store } from '../src/app/store';
import { App } from '../src/ui/App';

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
});
