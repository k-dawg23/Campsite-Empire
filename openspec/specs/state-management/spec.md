# state-management Specification

## Purpose

Define Redux Toolkit as the canonical state and simulation action layer for Campsite Empire v2.
## Requirements
### Requirement: Redux Canonical State

Campsite Empire v2 MUST use Redux Toolkit as the canonical state management layer.

#### Scenario: Game state changes through Redux

- **GIVEN** the player places a structure or changes simulation speed
- **WHEN** the action is performed
- **THEN** the change is represented by Redux actions and state updates

### Requirement: Serializable Game State

Redux game state MUST remain serializable.

#### Scenario: State is persisted or inspected

- **GIVEN** the current game state contains map, structures, tourists, economy, reviews, chatter, and AI status
- **WHEN** the state is inspected or persisted
- **THEN** it can be represented as JSON-compatible data without functions, class instances, or cyclic references

### Requirement: Redux Simulation Loop

The hourly game loop MUST dispatch Redux actions for simulation advancement.

#### Scenario: Time advances

- **GIVEN** the simulation speed is set to 1x, 2x, or 5x
- **WHEN** enough real time elapses for an in-game hour
- **THEN** a tick action advances the simulation by one in-game hour
