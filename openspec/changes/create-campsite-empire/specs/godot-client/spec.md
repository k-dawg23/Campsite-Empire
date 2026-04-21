# Godot Client Capability

## ADDED Requirements

### Requirement: Desktop Godot Project

The game MUST be implemented as a Godot 4.4 C# desktop project.

#### Scenario: Project opens in Godot

- **GIVEN** the project folder is opened with Godot 4.4
- **WHEN** the project loads
- **THEN** the main Campsite Empire scene is available and runnable

### Requirement: Isometric Map

The game MUST display a 16x16 isometric grid using Godot `TileMapLayer`.

#### Scenario: Map renders terrain

- **GIVEN** a new game starts
- **WHEN** the main scene renders
- **THEN** the player sees a 16x16 isometric map
- **AND** the map includes grass, water, trees, paths, and sand terrain

### Requirement: Build Placement

The player MUST be able to place plots and facilities by clicking valid empty tiles.

#### Scenario: Valid placement succeeds

- **GIVEN** the player selects a buildable structure
- **AND** hovers over an empty tile whose terrain allows that structure
- **WHEN** the player clicks the tile
- **THEN** the structure is placed
- **AND** the tile becomes occupied
- **AND** the structure's build cost is charged

#### Scenario: Invalid placement is blocked

- **GIVEN** the player selects a buildable structure
- **AND** hovers over water, trees, or an occupied tile
- **WHEN** the player clicks the tile
- **THEN** no structure is placed
- **AND** the UI communicates that placement is invalid

### Requirement: Management UI

The game MUST use Godot Control UI to expose core management controls.

#### Scenario: Player controls the simulation

- **GIVEN** the game is running
- **WHEN** the player views the main HUD
- **THEN** controls are available for build tools, speed, pricing, selected-object inspection, economy, weather, season, chatter, and reviews
