# React Client Capability

## ADDED Requirements

### Requirement: First-Visit Tutorial Modal

The React client MUST provide a multi-step tutorial modal that appears automatically on first visit and is tracked with localStorage.

#### Scenario: Tutorial appears on first visit

- **GIVEN** the tutorial seen flag is absent from localStorage
- **WHEN** the player opens Campsite Empire
- **THEN** a tutorial modal is shown
- **AND** the first step explains the game concept and goal

#### Scenario: Tutorial steps provide required controls

- **GIVEN** the tutorial modal is open
- **WHEN** the player views any tutorial step
- **THEN** the step has a title
- **AND** the step has a description
- **AND** the step has a Next button
- **AND** the step has a Skip button
- **AND** the step has a visible progress indicator

#### Scenario: Tutorial covers all required topics

- **GIVEN** the player advances through the tutorial
- **WHEN** all steps have been viewed
- **THEN** the tutorial has covered game concept and goal, building plots and facilities, tourist arrivals and plot choices, pricing strategy, weather and seasons, and AI features

#### Scenario: Tutorial seen state persists

- **GIVEN** the player skips or completes the tutorial
- **WHEN** the player returns to the app later
- **THEN** the tutorial does not automatically reopen

### Requirement: Help Reopens Tutorial

The React client MUST provide a Help button in the stats bar that reopens the tutorial.

#### Scenario: Help button opens tutorial

- **GIVEN** the tutorial has already been seen
- **WHEN** the player clicks Help in the stats bar
- **THEN** the tutorial modal opens again
- **AND** the player can navigate or skip the tutorial from the reopened modal
