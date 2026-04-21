# IndexedDB Save Schema

Campsite Empire v2 persists the canonical Redux game state to IndexedDB.

Database:

- Name: `campsite-empire-v2`
- Object store: `saves`
- Key: `autosave`

Save envelope:

```ts
interface SaveEnvelope {
  schemaVersion: 2;
  savedAt: string;
  state: GameState;
}
```

The saved `GameState` includes:

- map tiles and terrain
- structures and plot occupancy
- pricing
- tourists, stays, satisfaction, reviews, and chatter
- economy ledger, money, reputation, and demand
- clock, weather, and season
- AI provider status and fallback counters

Autosave runs every few seconds and the app loads the saved state on startup when the schema version matches.
