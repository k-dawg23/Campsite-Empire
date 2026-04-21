# Campsite Empire

Campsite Empire is a Godot 4.4 C# campground management simulation game. You manage a 16x16 isometric campground, place rentable plots and facilities, set prices, host tourists, read guest chatter and reviews, and grow your reputation through good planning.

## Requirements

- Godot 4.4 with .NET support
- .NET 8 SDK
- Godot desktop export templates
- Optional local AI provider:
  - Ollama at `http://localhost:11434/api/generate`
  - LM Studio compatible OpenAI-style endpoint
  - llama.cpp HTTP server

The game works without a local model. Tourist generation, plot selection, chatter, and reviews all have template-based fallbacks.

## Run

1. Open this folder in Godot 4.4.
2. Let Godot restore NuGet packages.
3. Run `res://scenes/Main.tscn`.

The save database is written to Godot's `user://campsite_empire.sqlite`.

## Local AI

AI output is requested as structured JSON. The parser extracts the first JSON object from the response, validates required fields, clamps unsafe values, and falls back to deterministic templates if anything is unavailable or malformed.

The preferred setup is to copy `.env.example` to `.env` in the project root and edit the values:

```env
CAMPSITE_AI_PROVIDER=ollama
CAMPSITE_AI_URL=http://localhost:11434/api/generate
CAMPSITE_AI_MODEL=llama3.1
```

For llama.cpp's OpenAI-compatible server, use:

```env
CAMPSITE_AI_PROVIDER=llamacpp
CAMPSITE_AI_URL=http://localhost:8080/v1/chat/completions
CAMPSITE_AI_MODEL=local-model
```

For exported desktop builds, place `.env` next to the executable. The game also checks Godot's `user://.env` location for user-specific configuration.

Configuration keys:

- `CAMPSITE_AI_PROVIDER`: `ollama`, `lmstudio`, `llamacpp`, or empty for fallback-first mode.
- `CAMPSITE_AI_URL`: provider endpoint URL.
- `CAMPSITE_AI_MODEL`: model name, default `llama3.1`.

Precedence is OS environment variable, then `.env`, then built-in default. That means shell variables can temporarily override the local file without editing it.

## Export

Install Godot desktop export templates, then use the included Linux and Windows export presets. SQLite is embedded through `Microsoft.Data.Sqlite`; verify the exported build can create a save in the platform user data directory.
