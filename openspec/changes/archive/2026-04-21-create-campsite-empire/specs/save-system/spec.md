# Save System Capability

## ADDED Requirements

### Requirement: SQLite Persistence

The game MUST persist the full game state to SQLite.

#### Scenario: Game state survives restart

- **GIVEN** the player has an active campground with terrain, structures, tourists, economy, weather, reviews, chatter, pricing, and clock state
- **WHEN** the game is saved and restarted
- **THEN** the game loads the same state from SQLite

### Requirement: Autosave

The game MUST autosave every few seconds.

#### Scenario: Autosave writes state

- **GIVEN** the game state has changed
- **WHEN** the autosave interval elapses
- **THEN** the current state is written to SQLite

### Requirement: Critical Transition Saves

The game MUST save after critical simulation transitions.

#### Scenario: Nightly billing completes

- **GIVEN** the nightly billing phase completes
- **WHEN** revenue and maintenance ledger entries are created
- **THEN** the updated economy state is saved

### Requirement: Schema Versioning

The SQLite save system MUST track schema version.

#### Scenario: Save database has version metadata

- **GIVEN** a save database exists
- **WHEN** the persistence layer opens it
- **THEN** schema version metadata is available for migrations
