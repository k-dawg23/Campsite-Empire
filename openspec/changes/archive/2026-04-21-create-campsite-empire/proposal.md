# Change Proposal: Create Campsite Empire

## Summary

Build Campsite Empire, a Godot 4.4 C# desktop campground management simulation game. The player manages a 16x16 isometric campground, builds rentable plots and guest facilities, sets prices, hosts AI-generated tourists, and grows the business through satisfaction, reviews, revenue, reputation, weather, and seasonal demand.

## Problem

The Campsite-Empire folder has no playable project yet. The requested experience needs more than a visual prototype: it requires a persistent simulation loop, meaningful tourist decision-making, structured local-AI integration with robust fallbacks, economy pressure, guest feedback, and a complete Godot UI suitable for desktop play.

## Goals

- Create a Godot 4.4 C# project for Campsite Empire.
- Render a 16x16 isometric `TileMapLayer` map with grass, water, trees, paths, and sand terrain.
- Let the player place tent sites, campervan spots, RV hookups, restrooms, showers, fire pits, playgrounds, and a camp store on valid empty tiles.
- Run a tick-based simulation where each tick is one in-game hour.
- Provide speed controls for pause, 1x, 2x, and 5x.
- Generate tourists every morning with name, personality, budget, and preferences.
- Evaluate plots using price, nearby facilities, preferences, reputation, weather, season, and availability.
- Track guest satisfaction over time using weather, facilities, neighbors, pricing, and plot fit.
- Generate guest chatter during stays and reviews on departure.
- Maintain an economy with nightly revenue, maintenance costs, pricing controls, reputation, and demand.
- Persist the full game state to SQLite with autosave every few seconds.
- Integrate a local AI provider while preserving complete template-based fallbacks.
- Package the project for desktop exports with Godot export templates.

## Non-Goals

- Multiplayer or online services.
- Cloud saves.
- Mobile or web exports.
- Real-money purchasing, ads, or platform store integration.
- Deep staff scheduling or employee simulation.
- Arbitrarily large maps beyond the required 16x16 grid.
- Hand-authored narrative campaigns.

## Proposed Approach

1. Scaffold a Godot 4.4 C# desktop project with scenes for the main game, map, build palette, HUD, tourist panel, economy panel, reviews, and settings.
2. Implement a 16x16 isometric map with terrain tile data, object occupancy data, placement validation, and a clear build interaction flow.
3. Model plots, facilities, tourists, reviews, chatter, weather, seasons, reputation, pricing, and economy as serializable C# domain objects.
4. Drive simulation through a centralized tick scheduler that advances one in-game hour per tick and supports pause, 1x, 2x, and 5x.
5. Add daily phases: weather and season demand calculation, morning arrivals, tourist plot evaluation, daytime satisfaction/chatter updates, nightly billing, maintenance costs, and departures/reviews.
6. Add an AI service abstraction with local-provider adapters and deterministic template fallback providers.
7. Require all AI calls to request structured JSON, parse the first JSON object from the response, validate against schemas, and fall back on validation failure.
8. Persist full state into SQLite tables and autosave periodically, with load-on-start behavior.
9. Add testable pure C# services for placement rules, plot scoring, satisfaction changes, economy math, AI response parsing, and save/load behavior.
10. Configure desktop export presets and document required local AI provider settings.

## Impact

### Gameplay

- Players can actively shape a campground and see tourists respond to pricing, facility placement, terrain, weather, seasons, and reputation.
- Reviews and chatter create readable feedback loops instead of hidden simulation math.
- Economy choices matter through revenue, maintenance costs, demand, and reputation changes.

### Technical

- Requires a durable Godot scene and script structure rather than a single-scene prototype.
- Requires SQLite initialization, schema migration, autosave, and state hydration.
- Requires local model integration with strict JSON validation and fallback templates.
- Requires export configuration for desktop builds.

### UX

- Godot Control UI must expose build tools, selected tile details, pricing controls, speed controls, time/weather/season, money, reputation, guest list, chatter, and reviews.
- Placement interactions should be immediate and readable: hover preview, invalid placement feedback, occupancy indication, and structure details.

## Risks

- Local AI tools may be unavailable, slow, or return invalid JSON; fallback behavior must be treated as a first-class path.
- SQLite persistence can become brittle if scene nodes directly own save logic; simulation state should be separated from presentation.
- Tourist scoring needs enough transparency to feel fair without exposing overwhelming numeric detail.
- Scope can sprawl quickly; the first playable version should prioritize a complete core loop before adding extra building types or cosmetic depth.

## Rollout Notes

- Build in vertical slices: map and placement first, then time/economy, then tourists and satisfaction, then AI enrichment, then persistence hardening, then packaging.
- Keep fallback AI templates enabled during development so the game remains testable without a running local model.
- Add save schema versioning from the beginning to avoid painful migration rewrites later.
