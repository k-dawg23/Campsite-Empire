# React Client Capability

## ADDED Requirements

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
