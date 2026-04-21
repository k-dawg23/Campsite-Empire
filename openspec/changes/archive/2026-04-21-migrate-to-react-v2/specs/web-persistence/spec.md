# Web Persistence Capability

## ADDED Requirements

### Requirement: IndexedDB Save State

Campsite Empire v2 MUST persist full game state to IndexedDB.

#### Scenario: Game survives refresh

- **GIVEN** the player has an active campground
- **WHEN** the browser page refreshes
- **THEN** the app restores map, structures, tourists, economy, clock, weather, season, reviews, chatter, prices, and AI status from IndexedDB

### Requirement: Autosave

The web app MUST autosave every few seconds.

#### Scenario: Autosave interval elapses

- **GIVEN** game state has changed
- **WHEN** the autosave interval elapses
- **THEN** the current Redux state is written to IndexedDB

### Requirement: Save Schema Version

The v2 save system MUST track save schema version.

#### Scenario: Save metadata exists

- **GIVEN** a save exists in IndexedDB
- **WHEN** the app loads it
- **THEN** schema version metadata is available before hydration
