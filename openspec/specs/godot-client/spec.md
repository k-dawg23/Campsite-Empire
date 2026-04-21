# godot-client Specification

## Purpose

Define how the retired v1 Godot/C# implementation is retained as legacy reference material.
## Requirements
### Requirement: Legacy Godot Archive

The repository MUST retain the v1 Godot/C# implementation only as a legacy archive, not as the active v2 runtime.

#### Scenario: Developer locates v1 implementation

- **GIVEN** a developer inspects the repository after the v2 migration
- **WHEN** they need the old Godot prototype
- **THEN** the Godot/C# files are available under `legacy-godot-v1`
- **AND** the active app remains the React/TypeScript runtime
