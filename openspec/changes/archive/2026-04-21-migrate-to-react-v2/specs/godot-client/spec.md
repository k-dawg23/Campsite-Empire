# Godot Client Capability

## ADDED Requirements

### Requirement: Legacy Godot Archive

The repository MUST retain the v1 Godot/C# implementation only as a legacy archive, not as the active v2 runtime.

#### Scenario: Developer locates v1 implementation

- **GIVEN** a developer inspects the repository after the v2 migration
- **WHEN** they need the old Godot prototype
- **THEN** the Godot/C# files are available under `legacy-godot-v1`
- **AND** the active app remains the React/TypeScript runtime

## REMOVED Requirements

### Requirement: Desktop Godot Project

The v2 runtime no longer uses Godot.

### Requirement: Isometric Map

The v2 runtime renders the isometric map in the browser instead of Godot `TileMapLayer`.

### Requirement: Build Placement

The v2 runtime handles build placement through the React browser UI.

### Requirement: Management UI

The v2 runtime uses React and Tailwind UI instead of Godot Control UI.
