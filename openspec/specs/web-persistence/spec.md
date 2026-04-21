# web-persistence Specification

## Purpose

Define browser persistence, autosave, and save schema requirements for Campsite Empire v2.
## Requirements
### Requirement: IndexedDB Save State

Campsite Empire v2 MUST persist full game state to IndexedDB and automatically restore the latest compatible saved state on page load.

#### Scenario: Game survives refresh

- **GIVEN** the player has an active campground
- **WHEN** the browser page refreshes
- **THEN** the app restores map, structures, tourists, economy, clock, weather, season, reviews, chatter, prices, and AI status from IndexedDB

#### Scenario: Last save restores on page load

- **GIVEN** a compatible saved game exists in IndexedDB
- **WHEN** the player opens the app
- **THEN** the saved game state is automatically loaded into the game

### Requirement: Autosave

The web app MUST autosave changed full game state to IndexedDB every 2 seconds.

#### Scenario: Changed state autosaves after interval

- **GIVEN** game state has changed since the previous save
- **WHEN** 2 seconds elapse
- **THEN** the current Redux game state is written to IndexedDB

#### Scenario: Unchanged state does not force repeated saves

- **GIVEN** game state has not changed since the previous save
- **WHEN** the autosave interval elapses
- **THEN** the app does not need to write an identical save again

### Requirement: Save Schema Version

The v2 save system MUST track save schema version.

#### Scenario: Save metadata exists

- **GIVEN** a save exists in IndexedDB
- **WHEN** the app loads it
- **THEN** schema version metadata is available before hydration

### Requirement: Speed Preference Uses LocalStorage

The app MUST persist game speed separately to localStorage.

#### Scenario: Speed survives slow IndexedDB

- **GIVEN** the player has selected a speed
- **WHEN** the app starts and IndexedDB restore is slow or unavailable
- **THEN** the app restores the last selected speed from localStorage

#### Scenario: LocalStorage speed wins over saved speed

- **GIVEN** IndexedDB contains a saved state with one speed
- **AND** localStorage contains a different saved speed
- **WHEN** the app hydrates the saved game
- **THEN** the localStorage speed is applied as the active speed

### Requirement: Manual Save Controls

The app MUST provide player-facing Save, Load, and protected New Game controls.

#### Scenario: Manual save writes current state

- **GIVEN** the player clicks Save
- **WHEN** IndexedDB is available
- **THEN** the current full game state is written to IndexedDB immediately
- **AND** the player receives save status feedback

#### Scenario: Manual load restores latest save

- **GIVEN** a compatible save exists in IndexedDB
- **WHEN** the player clicks Load
- **THEN** the saved game state is hydrated into the app
- **AND** the player receives load status feedback

#### Scenario: New Game requires double-confirmation

- **GIVEN** the player clicks New Game once
- **WHEN** the player has not completed a second confirmation
- **THEN** saved data is not cleared
- **AND** the current game is not reset

#### Scenario: New Game clears data after confirmation

- **GIVEN** the player has completed the required double-confirmation
- **WHEN** New Game is confirmed
- **THEN** IndexedDB save data is cleared
- **AND** localStorage speed data is cleared
- **AND** the current game state resets to a new campground

