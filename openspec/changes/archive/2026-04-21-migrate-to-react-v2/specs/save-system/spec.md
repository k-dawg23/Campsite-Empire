# Save System Capability

## ADDED Requirements

### Requirement: Legacy SQLite Archive

The repository MUST retain the v1 SQLite save layer only as legacy archived code, not as the active v2 save system.

#### Scenario: Developer inspects save implementations

- **GIVEN** a developer inspects persistence code after the v2 migration
- **WHEN** they compare v1 and v2 save systems
- **THEN** the v1 SQLite code is available under `legacy-godot-v1`
- **AND** the active v2 save system is the IndexedDB web persistence capability

## REMOVED Requirements

### Requirement: SQLite Persistence

The v2 runtime uses IndexedDB instead of SQLite.

### Requirement: Autosave

The v2 runtime defines autosave in the web persistence capability.

### Requirement: Critical Transition Saves

The v2 runtime defines critical transition saves in the web persistence capability.

### Requirement: Schema Versioning

The v2 runtime defines save schema versioning in the web persistence capability.
