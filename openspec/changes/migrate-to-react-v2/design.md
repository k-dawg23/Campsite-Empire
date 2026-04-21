# Design Notes: React v2.0.0 Migration

## Application Shape

Use a web-first architecture:

- `src/app`: Redux store setup, app providers, persistence middleware.
- `src/features/map`: map tiles, terrain, isometric rendering, placement interactions.
- `src/features/build`: build palette, definitions, placement validation.
- `src/features/simulation`: clock, weather, seasons, tick loop, demand.
- `src/features/tourists`: tourist generation, plot scoring, stays, satisfaction.
- `src/features/economy`: pricing, revenue, maintenance, ledger, reputation.
- `src/features/ai`: provider config, request clients, JSON extraction, fallbacks, status telemetry.
- `src/features/save`: IndexedDB persistence, schema versioning, import/export hooks.
- `src/components`: shared UI pieces.

## State Management

Redux Toolkit owns canonical game state. React components render selectors and dispatch user commands. Simulation ticks dispatch reducer actions; async AI calls dispatch thunks that either commit validated AI output or fallback output with a recorded reason.

State should be serializable so Redux DevTools, persistence, and debugging stay useful.

## Rendering

The map should be a browser-native isometric renderer. SVG is a good first choice because tiles, hover outlines, labels, and hit targets are easy to inspect. Canvas is acceptable if performance becomes a problem, but click hit testing must stay clean and deterministic.

The first screen must be the playable management view, not a landing page.

## Persistence

Use IndexedDB for full save state because the saved Redux tree can grow beyond comfortable localStorage limits. Persist:

- map and structures
- pricing and economy ledger
- tourists, stays, chatter, reviews
- clock, weather, season, demand
- AI status counters
- version metadata

Autosave every few seconds and after critical transitions such as arrivals, billing, maintenance, and reviews.

## AI Integration

Continue using `.env` values:

- `VITE_CAMPSITE_AI_PROVIDER`
- `VITE_CAMPSITE_AI_URL`
- `VITE_CAMPSITE_AI_MODEL`

Browser builds expose only `VITE_` variables at build time, so docs should explain the new names. Runtime UI settings can be considered later, but are not required for this change.

The AI layer must record whether the last response came from local AI or fallback. The UI should show provider state and fallback counts.

## Styling

Use Tailwind CSS for layout and components. The visual direction should feel like a crisp management sim: dense but legible panels, clear map affordances, readable color contrast, and responsive behavior for desktop-first browser play.
