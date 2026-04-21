# Change Proposal: Migrate Campsite Empire to React v2.0.0

## Why

The Godot/C# version proved frustrating to iterate on and debug for this project. The current build can render the map and place structures, but basic simulation feedback, AI visibility, and runtime behavior are harder to inspect than they should be. Campsite Empire will be easier to develop, test, and adjust as a web application with familiar browser tooling, inspectable state, and a simpler deployment model.

## What Changes

- Release the next major version as `v2.0.0`.
- Replace Godot 4.4 and C# with a React + TypeScript application.
- Use Redux Toolkit for canonical game state, simulation reducers, async AI thunks, and persistence orchestration.
- Use Tailwind CSS for styling and responsive management UI.
- Render the 16x16 isometric campground in the browser with HTML/CSS/SVG or Canvas, while preserving the same terrain, building, tourist, economy, weather, and review gameplay.
- Replace Godot desktop packaging with web packaging and documented local run/build commands.
- Replace SQLite persistence with browser-local persistence suitable for page refresh survival, preferably IndexedDB, with localStorage allowed only for small metadata.
- Keep `.env`-based AI configuration, structured JSON parsing, first-object extraction, and template fallbacks.

## Goals

- Create a v2.0.0 React + TypeScript + Redux Toolkit + Tailwind CSS implementation.
- Preserve the core game loop and management fantasy from v1:
  - 16x16 isometric map.
  - Terrain: grass, water, trees, paths, sand.
  - Buildable plots and facilities.
  - Tick-based hourly simulation with pause, 1x, 2x, and 5x speeds.
  - AI-generated tourists with fallback templates.
  - Plot selection, satisfaction, chatter, reviews, reputation, economy, weather, seasons, and pricing controls.
- Make simulation state inspectable and predictable through Redux DevTools-compatible state.
- Make AI usage visible in the UI through provider status, success/fallback counters, and last error/reason.
- Autosave state so the game survives page refreshes.
- Provide a polished browser-playable game, not a thin port of the Godot UI.

## Non-Goals

- Keeping Godot/C# code in the runtime path.
- Desktop-native packaging for v2.0.0.
- Multiplayer, cloud saves, or accounts.
- Server-hosted AI proxy as a required dependency.
- Exact visual parity with the v1 Godot prototype.
- Maintaining SQLite as the browser save layer.

## Proposed Approach

1. Scaffold a Vite React TypeScript app with Tailwind CSS, Redux Toolkit, and Vitest.
2. Move domain concepts into TypeScript types and Redux slices:
   - map/terrain
   - structures/building
   - simulation clock/weather/seasons
   - tourists/stays/satisfaction
   - economy/pricing/reputation
   - reviews/chatter
   - AI status
3. Implement the simulation as deterministic Redux reducers plus async thunks where needed.
4. Render the isometric map as a first-screen playable management view, with build palette, inspector, pricing controls, speed controls, economy bar, guest feed, reviews, and AI status.
5. Implement local AI clients for Ollama, llama.cpp OpenAI-compatible chat completions, and LM Studio where possible from the browser.
6. Keep template fallbacks as first-class behavior when AI endpoints are unavailable, blocked by CORS, timeout, or return invalid JSON.
7. Persist full Redux state to IndexedDB on an autosave interval and after critical simulation transitions.
8. Version the save schema and support initializing a fresh v2 save.
9. Update docs, `.env.example`, version metadata, and release tag instructions for `v2.0.0`.

## Impact

### User Experience

- The game runs in a browser during development and as static web assets after build.
- Players get clearer feedback on time progression, AI provider health, autosave state, and simulation changes.
- UI iteration becomes faster through Tailwind and browser dev tools.

### Technical

- Removes Godot and C# runtime dependencies from v2.
- Introduces Node/Vite dependency management.
- Requires a browser-compatible persistence layer rather than SQLite.
- Local AI calls may hit browser CORS limits; fallback behavior must remain seamless and visible.

### Repository

- Keep v1.0 history and tag intact.
- v2.0.0 may remove or archive Godot-specific files after implementation.
- Documentation must clearly state that v2 uses React/TypeScript and that v1.0 was the Godot prototype.

## Risks

- Browser CORS policies can block direct local AI calls to llama.cpp, Ollama, or LM Studio unless those servers allow local web origins.
- A Canvas/SVG isometric renderer must remain performant and readable even with many labels and overlays.
- Moving from SQLite to IndexedDB changes the persistence guarantees and migration story.
- If old Godot files remain beside the web app, the repo could feel confusing; implementation should either archive or clearly mark v1 assets.

## Rollout Notes

- Treat this as a breaking major release.
- Land v2 in a clean web app structure with a clear `npm run dev`, `npm run build`, and `npm test` workflow.
- Tag the implemented release as `v2.0.0`.
- Prefer a complete vertical slice before deleting Godot files, so the repo remains runnable during migration.
