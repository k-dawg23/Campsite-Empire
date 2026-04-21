# React Client Capability

## MODIFIED Requirements

### Requirement: Occupied Plot Visual State

The isometric map MUST visually distinguish occupied rentable plots by rendering an occupied-state indicator over the occupied plot's own structure visual.

#### Scenario: Occupied plot is visible

- **GIVEN** a tent site, campervan spot, or RV hookup is occupied by a tourist
- **WHEN** the map renders
- **THEN** the plot visual includes an occupied-state indicator
- **AND** the occupied-state indicator appears on the same grid square as the occupied structure image
- **AND** the occupied-state indicator renders in front of the occupied structure image
- **AND** the plot type remains identifiable

## ADDED Requirements

### Requirement: Build Palette Shows Affordability

The Build panel MUST visually distinguish unaffordable build items and prevent them from being selected.

#### Scenario: Unaffordable build item is disabled

- **GIVEN** the player's current cash is less than a buildable item's construction cost
- **WHEN** the Build panel renders
- **THEN** that item remains visible with its build cost
- **AND** that item uses a disabled or unavailable visual style
- **AND** that item cannot be selected

#### Scenario: Affordable build item remains selectable

- **GIVEN** the player's current cash is greater than or equal to a buildable item's construction cost
- **WHEN** the player selects that item in the Build panel
- **THEN** that item becomes the selected build item
- **AND** existing valid placement behavior is preserved
