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
