# Campsite Empire Project Context

## Purpose

Campsite Empire is a desktop campground management simulation game built in Godot 4.4 with C#. The player manages an isometric campground, places plots and facilities, sets prices, hosts tourists, and grows reputation through guest satisfaction and reviews.

## Technology

- Engine: Godot 4.4
- Language: C#
- UI: Godot Control UI
- Map: Godot `TileMapLayer` with isometric tiles
- Persistence: SQLite
- AI integration: local model provider such as Ollama, llama.cpp, or LM Studio, with template fallbacks
- Packaging: Godot desktop export templates

## Product Principles

- The game should feel complete and systemic, not like a thin prototype.
- Simulation state should be transparent enough for the player to understand cause and effect.
- AI-generated content should enrich the simulation while remaining deterministic enough to save, debug, and fall back safely.
- The full game state must survive refreshes, restarts, and autosaves.

## Constraints

- AI output must be structured JSON and validated against explicit schemas.
- When a local model is unavailable or returns invalid JSON, the game must continue with template-based fallbacks.
- SQLite persistence is required for full game state, not just player settings.
