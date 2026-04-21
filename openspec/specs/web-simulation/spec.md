# web-simulation Specification

## Purpose

Define web-specific gameplay loop requirements for Campsite Empire v2.
## Requirements
### Requirement: Gameplay Parity

Campsite Empire v2 MUST preserve the core simulation systems from v1.

#### Scenario: Core loop runs

- **GIVEN** the player has built rentable plots
- **WHEN** multiple in-game days pass
- **THEN** tourists arrive, evaluate plots, stay or leave, change satisfaction, produce chatter, pay nightly revenue, depart, leave reviews, and affect reputation

### Requirement: Speed Controls

The web app MUST provide pause, 1x, 2x, and 5x speed controls.

#### Scenario: Player changes speed

- **GIVEN** the game is running
- **WHEN** the player selects a speed
- **THEN** the tick loop uses the selected speed
- **AND** the UI visibly reflects the active speed

### Requirement: Pricing Controls

The web app MUST provide pricing controls for tent sites, campervan spots, and RV hookups.

#### Scenario: Player changes plot price

- **GIVEN** the player adjusts a plot type price
- **WHEN** future tourists evaluate plots
- **THEN** the updated price affects plot scoring and nightly revenue
