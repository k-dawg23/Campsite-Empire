# react-client Specification

## Purpose

Define the active React, TypeScript, Tailwind, and browser map client for Campsite Empire v2.
## Requirements
### Requirement: React TypeScript Application

Campsite Empire v2 MUST be implemented as a React + TypeScript application.

#### Scenario: Developer starts the v2 app

- **GIVEN** project dependencies are installed
- **WHEN** the developer runs the documented development command
- **THEN** the React app starts locally
- **AND** the first screen is the playable Campsite Empire management view

### Requirement: Tailwind Styling

Campsite Empire v2 MUST use Tailwind CSS for application styling.

#### Scenario: UI renders with Tailwind styles

- **GIVEN** the app is running
- **WHEN** the player opens the game
- **THEN** the map, panels, controls, feeds, and inspectors render using Tailwind-based styling

### Requirement: Browser Isometric Map

The app MUST render a 16x16 isometric campground map in the browser.

#### Scenario: Map displays required terrain

- **GIVEN** a new v2 game starts
- **WHEN** the main view renders
- **THEN** the player sees a 16x16 isometric map
- **AND** the map includes grass, water, trees, paths, and sand terrain

### Requirement: Browser Building System

The app MUST let the player place plots and facilities by clicking valid empty tiles.

#### Scenario: Valid placement succeeds

- **GIVEN** the player selects a buildable item
- **AND** an empty tile allows that item
- **WHEN** the player clicks the tile
- **THEN** the structure is placed
- **AND** the build cost is charged

#### Scenario: Invalid placement is blocked

- **GIVEN** the player selects a buildable item
- **AND** the target tile is occupied or invalid terrain
- **WHEN** the player clicks the tile
- **THEN** no structure is placed
- **AND** the UI shows invalid placement feedback

### Requirement: Build Palette Shows Build Costs

The Build panel MUST show construction cost for every buildable item.

#### Scenario: Plot build buttons show construction cost

- **GIVEN** the Build panel is visible
- **WHEN** the player views tent site, campervan spot, and RV hookup build buttons
- **THEN** each button shows the structure build cost
- **AND** none of those build buttons uses nightly `/night` pricing as its primary price

#### Scenario: Nightly price remains available

- **GIVEN** the player needs to inspect or change nightly pricing
- **WHEN** they view the Prices panel or selected plot inspector
- **THEN** nightly prices remain visible outside the Build panel

### Requirement: Map Uses Structure Visuals

The isometric map MUST render recognizable visual imagery for placed structures instead of circle-letter markers.

#### Scenario: Placed structures show item imagery

- **GIVEN** structures are placed on the map
- **WHEN** the map renders
- **THEN** each structure type is represented by an item-specific visual
- **AND** the map does not rely on circle-letter markers as the primary structure representation

### Requirement: Occupied Plot Visual State

The isometric map MUST visually distinguish occupied rentable plots.

#### Scenario: Occupied plot is visible

- **GIVEN** a tent site, campervan spot, or RV hookup is occupied by a tourist
- **WHEN** the map renders
- **THEN** the plot visual includes an occupied-state indicator
- **AND** the plot type remains identifiable

