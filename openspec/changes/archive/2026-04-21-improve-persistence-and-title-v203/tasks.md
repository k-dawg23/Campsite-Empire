## 1. Persistence

- [x] Keep full game state persistence in IndexedDB.
- [x] Autosave changed game state every 2 seconds.
- [x] Automatically restore the last saved IndexedDB state on page load.
- [x] Persist game speed separately to localStorage.
- [x] Restore localStorage speed independently of IndexedDB hydration.
- [x] Add or update tests for autosave and restore behavior.

## 2. Save controls

- [x] Add Save button that immediately writes the current game state.
- [x] Add Load button that restores the latest saved game state.
- [x] Add New Game button that resets current state only after double-confirmation.
- [x] Ensure New Game clears IndexedDB save data and speed localStorage after confirmation.
- [x] Add player-visible status feedback for Save, Load, and New Game outcomes.
- [x] Add or update UI tests for Save, Load, and double-confirmed New Game behavior.

## 3. Header and version

- [x] Remove visible version number from the title/header area.
- [x] Remove visible stack details from the title/header area.
- [x] Keep internal/package version metadata and bump it to `2.0.3`.
- [x] Add or update UI tests confirming the player-facing header does not show version or stack details.

## 4. Verification

- [x] Run unit/UI tests.
- [x] Run production build.
- [x] Run OpenSpec validation.
