# AI Capability

## ADDED Requirements

### Requirement: Local AI Provider

The game MUST support a local AI model provider such as Ollama, llama.cpp, LM Studio, or another local tool.

#### Scenario: Provider returns valid structured output

- **GIVEN** a local AI provider is configured and reachable
- **WHEN** the game requests tourist generation, plot selection, chatter, or review content
- **THEN** the provider response is parsed as structured JSON
- **AND** the validated result is used by the simulation

### Requirement: Template Fallbacks

Every AI feature MUST have a template-based fallback.

#### Scenario: Provider is unavailable

- **GIVEN** the local AI provider is unavailable, times out, or returns invalid data
- **WHEN** an AI feature is requested
- **THEN** the game uses a deterministic template fallback
- **AND** the simulation continues without blocking play

### Requirement: JSON Object Extraction

The AI layer MUST parse the first JSON object from model responses.

#### Scenario: Response contains extra text

- **GIVEN** a model response contains text before or after a JSON object
- **WHEN** the AI parser receives the response
- **THEN** it extracts the first complete JSON object
- **AND** validates the extracted object against the expected schema

### Requirement: Tourist Generation Schema

Tourist generation MUST return JSON matching the tourist profile schema.

#### Scenario: Tourist profile is valid

- **GIVEN** tourist generation is requested
- **WHEN** valid AI or fallback output is produced
- **THEN** the result includes `name`, `personality`, `budget`, `preferences`, and `stay_nights`

### Requirement: Plot Selection Schema

Plot selection MUST return JSON matching the decision schema.

#### Scenario: Plot decision is valid

- **GIVEN** a tourist evaluates plots
- **WHEN** valid AI or fallback output is produced
- **THEN** the result includes ranked plot decisions, a selected plot id or null, a stay-or-leave decision, and a reason

### Requirement: Chatter Schema

Guest chatter MUST return JSON matching the chatter schema.

#### Scenario: Chatter is valid

- **GIVEN** guest chatter is requested
- **WHEN** valid AI or fallback output is produced
- **THEN** the result includes tourist id, mood, text, and in-game timestamp

### Requirement: Review Schema

Reviews MUST return JSON matching the review schema.

#### Scenario: Review is valid

- **GIVEN** a tourist departs
- **WHEN** valid AI or fallback output is produced
- **THEN** the result includes 1-5 stars, review text, and optional tags
