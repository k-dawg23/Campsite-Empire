# save-system Specification

## Purpose

Define how the retired v1 SQLite save layer is retained as legacy reference material.
## Requirements
### Requirement: Legacy SQLite Archive

The repository MUST retain the v1 SQLite save layer only as legacy archived code, not as the active v2 save system.

#### Scenario: Developer inspects save implementations

- **GIVEN** a developer inspects persistence code after the v2 migration
- **WHEN** they compare v1 and v2 save systems
- **THEN** the v1 SQLite code is available under `legacy-godot-v1`
- **AND** the active v2 save system is the IndexedDB web persistence capability
