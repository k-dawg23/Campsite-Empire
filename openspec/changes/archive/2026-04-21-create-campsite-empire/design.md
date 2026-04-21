# Design Notes: Campsite Empire

## Architecture

Use a separation between simulation state, Godot presentation, persistence, and AI providers.

- `Simulation`: pure C# domain models and services for time, economy, tourists, satisfaction, plot scoring, weather, seasons, and reviews.
- `Presentation`: Godot scenes, `TileMapLayer`, controls, build previews, panels, and visual feedback.
- `Persistence`: SQLite schema, repositories, migrations, autosave orchestration, and full-state hydration.
- `AI`: provider interfaces, local model adapters, JSON extraction/validation, prompt templates, and fallback generators.

## Core Game Loop

Each simulation tick represents one in-game hour.

- 06:00: new day begins, weather rolls, seasonal demand is calculated, tourists arrive.
- 07:00-20:00: guests update satisfaction and may produce chatter.
- 21:00: nightly revenue is collected from occupied plots.
- 22:00: maintenance costs are charged.
- 08:00 next day or configured checkout time: departing guests leave reviews and free plots.

The exact hour timings can be tuned, but these phases must be explicit and testable.

## Tourist Decision Model

Tourists evaluate available plots through a weighted score:

- Affordability compared with budget.
- Plot type preference match.
- Distance to preferred facilities.
- Distance from disliked noise sources or crowding.
- Weather suitability.
- Season demand pressure.
- Campground reputation.
- Current price fairness.

Tourists stay when the winning plot score clears a decision threshold. Otherwise they leave and may generate a short rejection reason.

## AI Contracts

All AI features use structured JSON:

- Tourist generation returns a tourist profile.
- Plot selection returns ranked plot decisions and reasoning.
- Review generation returns stars and text.
- Chatter generation returns short in-world comments.

The parser extracts the first JSON object from a provider response. Invalid JSON, schema mismatch, timeout, unavailable provider, or unsafe values must trigger deterministic template fallback.

## Persistence Strategy

SQLite stores canonical simulation state. Godot nodes render from hydrated state and publish player commands back to services.

Minimum tables:

- `save_metadata`
- `map_tiles`
- `structures`
- `pricing`
- `tourists`
- `stays`
- `reviews`
- `chatter`
- `economy_ledger`
- `weather_history`
- `simulation_clock`

Autosave runs every few seconds and after critical transitions such as nightly billing and departures.

## UI Shape

The first screen is the playable management view:

- Isometric map as the central focus.
- Build palette for plots and facilities.
- Speed controls and time/weather/season display.
- Money, reputation, occupancy, and demand indicators.
- Inspector for selected tile, structure, or tourist.
- Pricing panel per plot type.
- Chatter and review feed.

The UI should support real play without debug-only controls.
