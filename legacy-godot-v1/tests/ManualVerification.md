# Manual Verification

Use this checklist on a machine with Godot 4.4 .NET and the .NET 8 SDK installed.

- Open the project in Godot 4.4 and run `res://scenes/Main.tscn`.
- Confirm the first screen is the playable campground view, not a landing page.
- Confirm the 16x16 isometric map shows grass, water, trees, paths, and sand.
- Select each build item and place it on valid empty terrain.
- Confirm invalid placement on water, trees, or occupied tiles is blocked.
- Change prices for tent, campervan, and RV plots.
- Run the game at pause, 1x, 2x, and 5x.
- Let at least three days pass and confirm arrivals, occupancy, chatter, revenue, maintenance, departures, reviews, and reputation changes.
- Quit and reopen the project, then confirm SQLite save state is restored.
- Test with no local AI provider configured and confirm template fallback content appears.
- Test with `CAMPSITE_AI_PROVIDER=ollama` and a running local model, then confirm AI responses are still validated and fallback is used for malformed output.
- Export a desktop build using the included presets after installing Godot export templates.
