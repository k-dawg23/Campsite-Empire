# SQLite Save Schema

The canonical game state is saved in `save_metadata.json_state` for reliable full-state hydration. Normalized tables are also written for inspection, debugging, and future migrations.

Tables:

- `save_metadata`: schema version, save timestamp, canonical JSON state.
- `map_tiles`: 16x16 terrain and occupancy references.
- `structures`: placed plots and facilities.
- `pricing`: per-plot-type nightly prices.
- `tourists`: tourist profile and simulation state JSON.
- `stays`: plot assignment and stay progress.
- `reviews`: departing guest reviews.
- `chatter`: guest chatter feed.
- `economy_ledger`: build costs, revenue, maintenance, and adjustments.
- `weather_history`: daily weather, season, and demand.
- `simulation_clock`: current day, hour, weather, season, money, reputation, and demand.

Autosave runs every few seconds and after simulation ticks that may include billing, maintenance, arrivals, chatter, or reviews.
