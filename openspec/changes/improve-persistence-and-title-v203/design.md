# Design Notes: v2.0.3 Persistence and Header Polish

## Save Timing

The current IndexedDB save layer should remain the source of truth for full game state. Autosave should run when state changes and should write no later than 2 seconds after the latest change. A debounce or interval-with-dirty-flag approach is acceptable as long as unchanged state is not written repeatedly forever.

## Manual Controls

The UI should expose Save, Load, and New Game as direct player actions. These controls fit naturally in the Inspector or a compact management panel because they affect the whole campground rather than a specific tile.

Save should write the current Redux game state to IndexedDB immediately. Load should attempt to read the last IndexedDB save and hydrate the game if present. Both actions should update existing status text or a compact save status line so the player gets feedback without a modal.

## New Game Protection

New Game must not clear data on a single click. A two-step confirmation is required. Acceptable designs include:

- First click arms a clear intent and changes the button text.
- Second click within a short window performs the reset.

Browser confirm dialogs are acceptable for one of the steps, but an in-app confirmation is preferred if it fits existing UI patterns.

## Speed Persistence

Game speed should be written to localStorage separately from IndexedDB, using a stable key such as `campsite-empire-speed`. On app start, localStorage speed should be applied independently so the speed preference is available even if IndexedDB is slow or unavailable.

If IndexedDB hydration includes a different speed, the localStorage speed should win because this requirement treats speed as a separate preference.

## Header

The visible title/header should show `Campsite Empire` as the game identity. Version number and stack details should be removed from the player-facing title area. Version metadata can remain in internal state, package files, README, or hidden diagnostics if needed later.
