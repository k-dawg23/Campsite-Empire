## 1. Persistence

- [ ] Keep full game state persistence in IndexedDB.
- [ ] Autosave changed game state every 2 seconds.
- [ ] Automatically restore the last saved IndexedDB state on page load.
- [ ] Persist game speed separately to localStorage.
- [ ] Restore localStorage speed independently of IndexedDB hydration.
- [ ] Add or update tests for autosave and restore behavior.

## 2. Save controls

- [ ] Add Save button that immediately writes the current game state.
- [ ] Add Load button that restores the latest saved game state.
- [ ] Add New Game button that resets current state only after double-confirmation.
- [ ] Ensure New Game clears IndexedDB save data and speed localStorage after confirmation.
- [ ] Add player-visible status feedback for Save, Load, and New Game outcomes.
- [ ] Add or update UI tests for Save, Load, and double-confirmed New Game behavior.

## 3. Header and version

- [ ] Remove visible version number from the title/header area.
- [ ] Remove visible stack details from the title/header area.
- [ ] Keep internal/package version metadata and bump it to `2.0.3`.
- [ ] Add or update UI tests confirming the player-facing header does not show version or stack details.

## 4. Verification

- [ ] Run unit/UI tests.
- [ ] Run production build.
- [ ] Run OpenSpec validation.
