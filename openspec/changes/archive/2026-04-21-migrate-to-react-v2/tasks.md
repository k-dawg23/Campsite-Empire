## 1. Project migration

- [x] Scaffold React + TypeScript app with Vite.
- [x] Install and configure Redux Toolkit.
- [x] Install and configure Tailwind CSS.
- [x] Add Vitest and Testing Library.
- [x] Set version metadata to `2.0.0`.
- [x] Update README to describe v2 as the React/TypeScript version.

## 2. State model

- [x] Port game domain models from C# to TypeScript types.
- [x] Create Redux slices for map, structures, simulation, tourists, economy, AI, and save metadata.
- [x] Ensure game state remains serializable and Redux DevTools-friendly.
- [x] Add selectors for occupancy, money, reputation, demand, available plots, and visible feeds.

## 3. Map and building UI

- [x] Render a 16x16 isometric map in the browser.
- [x] Support terrain types: grass, water, trees, paths, sand.
- [x] Implement build palette for plots and facilities.
- [x] Support click-to-place on valid empty tiles.
- [x] Show hover preview, selection, invalid placement, occupancy, and unhappy guest indicators.
- [x] Add selected tile/structure/tourist inspector.

## 4. Simulation

- [x] Implement hourly tick loop with pause, 1x, 2x, and 5x controls.
- [x] Implement day/hour, weather, seasons, and demand.
- [x] Implement morning arrivals, plot evaluation, satisfaction updates, chatter, billing, maintenance, departures, and reviews.
- [x] Add pricing controls for tent sites, campervan spots, and RV hookups.
- [x] Add economy ledger and reputation updates.

## 5. AI

- [x] Implement browser AI client abstraction for Ollama, llama.cpp chat completions, and LM Studio where possible.
- [x] Keep structured JSON prompts and first-object extraction.
- [x] Add schema validation and value clamping for all AI outputs.
- [x] Add template fallbacks for tourist generation, plot selection, chatter, and reviews.
- [x] Add AI status UI showing provider, last success/fallback, fallback count, and last error/reason.
- [x] Document CORS requirements for browser-to-local-model calls.

## 6. Persistence

- [x] Persist full Redux game state to IndexedDB.
- [x] Autosave every few seconds.
- [x] Save after critical simulation transitions.
- [x] Load existing save on startup.
- [x] Add schema versioning for v2 saves.
- [x] Provide reset/new game action.

## 7. Styling and game feel

- [x] Build polished Tailwind management UI.
- [x] Make the first screen the playable game view.
- [x] Add responsive layout constraints for desktop and smaller screens.
- [x] Ensure text does not overlap or overflow controls.
- [x] Balance costs, prices, demand, weather effects, and satisfaction for the first 10 minutes of play.

## 8. Tests and verification

- [x] Add unit tests for reducers and selectors.
- [x] Add tests for placement validation.
- [x] Add tests for plot scoring and tourist stay/leave decisions.
- [x] Add tests for satisfaction and economy calculations.
- [x] Add tests for JSON extraction, schema validation, and fallback behavior.
- [x] Add tests for IndexedDB save/load behavior.
- [x] Manually verify local AI fallback and llama.cpp/Ollama configuration.

## 9. Release

- [x] Remove or archive Godot/C# runtime files after v2 is playable.
- [x] Run full test/build checks.
- [x] Commit the migration.
- [x] Tag release as `v2.0.0`.
- [x] Push `main` and `v2.0.0` tag to GitHub.
