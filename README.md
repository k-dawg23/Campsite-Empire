# Campsite Empire

Campsite Empire v2.0.4 is a React + TypeScript campground management simulation game. You manage a 16x16 isometric campground, place rentable plots and facilities, set prices, host tourists, read guest chatter and reviews, and grow reputation through good planning.

The v1.0 Godot/C# prototype is preserved in Git history and archived in `legacy-godot-v1/`. The active runtime is the browser app.

## Requirements

- Node.js 22 or newer
- npm 11 or newer
- Optional local AI provider:
  - Ollama at `http://localhost:11434/api/chat`
  - llama.cpp OpenAI-compatible endpoint such as `http://localhost:8080/v1/chat/completions`
  - LM Studio OpenAI-compatible endpoint such as `http://localhost:1234/v1/chat/completions`

The game works without a local model. Tourist generation, plot selection, chatter, and reviews all have template-based fallbacks.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The first screen is the playable management view.

## Build And Test

```bash
npm test
npm run build
```

The production build is emitted to `dist/`.

## Local AI

AI output is requested as structured JSON. The parser extracts the first JSON object from the response, validates required fields, clamps unsafe values, and falls back to deterministic templates if anything is unavailable or malformed.

The preferred setup is to copy `.env.example` to `.env` in the project root and edit the Vite-exposed values:

```env
VITE_CAMPSITE_AI_PROVIDER=ollama
VITE_CAMPSITE_AI_URL=http://localhost:11434/api/generate
VITE_CAMPSITE_AI_MODEL=llama3.1
VITE_CAMPSITE_AI_TIMEOUT_MS=30000
```

For llama.cpp's OpenAI-compatible server:

```env
VITE_CAMPSITE_AI_PROVIDER=llamacpp
VITE_CAMPSITE_AI_URL=http://localhost:8080/v1/chat/completions
VITE_CAMPSITE_AI_MODEL=local-model
VITE_CAMPSITE_AI_TIMEOUT_MS=60000
```

Browser security may require enabling CORS on your local model server. If a request is blocked, times out, or returns invalid JSON, the game records the fallback reason in the AI Status panel and continues with template output.

If you change `.env`, restart `npm run dev`. For a production preview or packaged build, run `npm run build` again and restart the server serving `dist/`. Saved games refresh the AI provider, URL, and model from the current environment when they load, while keeping campground progress.

If AI Status says a request timed out, increase `VITE_CAMPSITE_AI_TIMEOUT_MS` and restart the app. llama.cpp can be slow on the first request while the model warms up.

## Saves

v2 persists the full Redux game state to IndexedDB. Autosave runs every few seconds and after simulation transitions. Use the New Game button to clear the local save and start over.

## Version

Current version: `2.0.4`
