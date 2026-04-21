## 1. Project foundation

- [x] Create Godot 4.4 C# project files and desktop-oriented project settings.
- [x] Add main scenes for game root, map, HUD, build palette, inspectors, reviews, chatter, and settings.
- [x] Define folder structure for simulation, presentation, persistence, AI, assets, and tests.
- [x] Configure C# dependencies needed for SQLite.

## 2. Isometric map and terrain

- [x] Implement a 16x16 `TileMapLayer` isometric map.
- [x] Add terrain tile definitions for grass, water, trees, paths, and sand.
- [x] Generate or author a starter campground layout with mixed terrain.
- [x] Track tile occupancy and terrain placement constraints.
- [x] Add hover, selection, and invalid-placement visual states.

## 3. Building system

- [x] Add buildable definitions for tent sites, campervan spots, RV hookups, restrooms, showers, fire pits, playgrounds, and camp store.
- [x] Implement click-to-place behavior on valid empty tiles.
- [x] Prevent placement on occupied tiles and invalid terrain.
- [x] Charge build costs and add ongoing maintenance costs.
- [x] Add structure inspector details and remove/sell controls if included in scope.

## 4. Simulation clock

- [x] Implement tick scheduler where each tick equals one in-game hour.
- [x] Add pause, 1x, 2x, and 5x speed controls.
- [x] Add day, hour, season, and weather state.
- [x] Trigger daily arrival, satisfaction, billing, maintenance, departure, and review phases.

## 5. Tourists and plot selection

- [x] Model tourists with name, personality, budget, preferences, stay length, satisfaction, and current state.
- [x] Generate morning tourist arrivals based on season, reputation, weather, and available capacity.
- [x] Score available plots by price, facility proximity, preference fit, neighbors, reputation, and weather.
- [x] Assign tourists to plots when score thresholds are met.
- [x] Record tourists who leave without staying with a reason.

## 6. Satisfaction, chatter, and reviews

- [x] Update satisfaction over time based on weather, facilities, neighbors, pricing, and plot fit.
- [x] Generate guest chatter throughout the day.
- [x] Generate departure reviews with 1-5 stars and text.
- [x] Update reputation from reviews.
- [x] Display chatter and reviews in readable UI feeds.

## 7. Economy and pricing

- [x] Add pricing controls for tent sites, campervan spots, and RV hookups.
- [x] Collect nightly revenue from occupied plots.
- [x] Charge daily maintenance costs for structures.
- [x] Track money, daily profit/loss, occupancy, demand, and reputation.
- [x] Add economy ledger entries for builds, revenue, maintenance, and adjustments.

## 8. AI integration

- [x] Add provider abstraction for local model tools such as Ollama, llama.cpp, or LM Studio.
- [x] Implement structured prompt templates for tourist generation, plot selection, chatter, and reviews.
- [x] Define JSON schemas for every AI output type.
- [x] Parse the first JSON object from provider responses.
- [x] Validate parsed JSON and clamp unsafe or out-of-range values.
- [x] Add template-based fallbacks for every AI feature.
- [x] Add provider timeout and unavailable-provider handling.

## 9. SQLite persistence

- [x] Create SQLite schema and migrations for full game state.
- [x] Save and load map tiles, structures, pricing, tourists, stays, reviews, chatter, economy, weather, and clock.
- [x] Autosave every few seconds.
- [x] Save after critical transitions such as nightly billing and review creation.
- [x] Load existing save on startup and initialize a new save when none exists.
- [x] Add schema versioning.

## 10. Polish and game feel

- [x] Add map sprites or tile art that clearly communicate terrain and structures.
- [x] Add tooltips and inspector details for prices, maintenance, satisfaction, and plot fit.
- [x] Add visual indicators for occupied plots, unhappy guests, high-demand days, and bad weather.
- [x] Balance starting money, build costs, maintenance, demand, and review reputation.
- [x] Make the first 10 minutes of play understandable without debug explanations.

## 11. Verification

- [x] Add tests for placement validation and occupancy.
- [x] Add tests for plot scoring and tourist stay/leave decisions.
- [x] Add tests for satisfaction updates.
- [x] Add tests for economy calculations.
- [x] Add tests for first-JSON-object extraction and schema fallback behavior.
- [x] Add tests for SQLite save/load round trips.
- [ ] Manually verify a fresh game, autosave reload, and desktop export run.

## 12. Packaging

- [x] Add Godot desktop export presets.
- [x] Document required Godot export templates.
- [x] Document local AI provider configuration and fallback behavior.
- [x] Produce desktop build instructions.
