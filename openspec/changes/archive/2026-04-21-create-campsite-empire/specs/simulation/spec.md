# Simulation Capability

## ADDED Requirements

### Requirement: Tick-Based Time

The simulation MUST advance in ticks where each tick represents one in-game hour.

#### Scenario: Speed control changes tick rate

- **GIVEN** the simulation is running
- **WHEN** the player selects pause, 1x, 2x, or 5x
- **THEN** simulation ticks advance at the selected speed
- **AND** paused mode stops simulation advancement

### Requirement: Morning Tourist Arrivals

The game MUST generate tourist arrivals each morning based on season, weather, reputation, and available capacity.

#### Scenario: Tourists arrive in the morning

- **GIVEN** the in-game clock reaches the morning arrival phase
- **WHEN** demand is greater than zero
- **THEN** tourists are generated with a name, personality, budget, and preferences

### Requirement: Plot Selection

Tourists MUST evaluate available plots before deciding to stay or leave.

#### Scenario: Tourist chooses a suitable plot

- **GIVEN** a tourist arrives
- **AND** one or more plots are available
- **WHEN** the plot selection service scores the plots
- **THEN** the tourist stays on the highest-scoring plot when it meets the stay threshold

#### Scenario: Tourist leaves when no plot is acceptable

- **GIVEN** a tourist arrives
- **AND** no available plot satisfies budget and preference thresholds
- **WHEN** plot selection completes
- **THEN** the tourist leaves
- **AND** a leave reason is recorded

### Requirement: Satisfaction System

The game MUST update tourist satisfaction over time.

#### Scenario: Satisfaction changes during stay

- **GIVEN** a tourist is staying at a plot
- **WHEN** a daytime satisfaction tick runs
- **THEN** satisfaction changes based on weather, nearby facilities, neighbors, pricing, and preference fit

### Requirement: Reviews and Reputation

Departing tourists MUST leave reviews that affect campground reputation.

#### Scenario: Review updates reputation

- **GIVEN** a tourist departs after a stay
- **WHEN** a review is created
- **THEN** the review includes 1-5 stars and text
- **AND** campground reputation is recalculated from reviews

### Requirement: Economy

The simulation MUST track revenue, costs, pricing, money, and ledger entries.

#### Scenario: Nightly economy phase runs

- **GIVEN** the clock reaches the nightly billing phase
- **WHEN** occupied plots exist
- **THEN** nightly revenue is added for each occupied plot
- **AND** maintenance costs are charged for structures
- **AND** ledger entries are recorded

### Requirement: Weather and Seasons

Weather MUST change daily and seasons MUST affect tourist demand.

#### Scenario: New day updates conditions

- **GIVEN** a new day begins
- **WHEN** daily conditions are rolled
- **THEN** weather is updated
- **AND** the current season modifies tourist demand
