# Campsite Empire Project Context

## Purpose

Campsite Empire is a browser-based campground management simulation game built with React, TypeScript, Redux Toolkit, and Tailwind CSS. The player manages an isometric campground, places plots and facilities, sets prices, hosts tourists, and grows reputation through guest satisfaction and reviews.

## Technology

- Runtime: React web app with Vite
- Language: TypeScript
- State: Redux Toolkit
- Styling: Tailwind CSS
- Map: browser-rendered 16x16 isometric grid
- Persistence: IndexedDB
- AI integration: local model provider such as Ollama, llama.cpp, or LM Studio, with template fallbacks
- Packaging: static web build

## Product Principles

- The game should feel complete and systemic, not like a thin prototype.
- Simulation state should be transparent enough for the player to understand cause and effect.
- AI-generated content should enrich the simulation while remaining deterministic enough to save, debug, and fall back safely.
- The full game state must survive refreshes, restarts, and autosaves.

## Constraints

- AI output must be structured JSON and validated against explicit schemas.
- When a local model is unavailable or returns invalid JSON, the game must continue with template-based fallbacks.
- IndexedDB persistence is required for full game state, not just player settings.
- The v1 Godot/C# implementation is retained only as a legacy archive under `legacy-godot-v1`.
