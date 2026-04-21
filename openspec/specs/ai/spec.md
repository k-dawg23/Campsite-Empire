# ai Specification

## Purpose

Define how Campsite Empire configures local AI providers and keeps AI features reliable through deterministic fallback behavior.
## Requirements
### Requirement: .env AI Configuration

The game MUST support configuring local AI provider settings from `.env` values appropriate to the current runtime.

#### Scenario: .env file configures local AI

- **GIVEN** a v2 `.env` file contains `VITE_CAMPSITE_AI_PROVIDER`, `VITE_CAMPSITE_AI_URL`, and `VITE_CAMPSITE_AI_MODEL`
- **AND** matching runtime overrides are not set
- **WHEN** the AI service initializes in the browser app
- **THEN** the game uses the `.env` values for local AI configuration

#### Scenario: Missing .env file uses defaults and fallback behavior

- **GIVEN** no `.env` AI values are available
- **WHEN** the AI service initializes
- **THEN** built-in defaults are used
- **AND** template-based AI fallbacks remain available

### Requirement: AI Configuration Precedence

The game MUST resolve AI configuration using OS environment variables before `.env` values before built-in defaults.

#### Scenario: OS environment variable overrides .env value

- **GIVEN** `.env` sets `CAMPSITE_AI_MODEL=llama3.1`
- **AND** the OS environment sets `CAMPSITE_AI_MODEL=mistral`
- **WHEN** the AI service reads configuration
- **THEN** `CAMPSITE_AI_MODEL` resolves to `mistral`

### Requirement: .env File Robustness

The game MUST tolerate missing, blank, commented, or partially invalid `.env` files.

#### Scenario: Invalid .env lines are ignored

- **GIVEN** a `.env` file includes comments, blank lines, valid key/value lines, and malformed lines
- **WHEN** configuration is loaded
- **THEN** valid key/value lines are used
- **AND** malformed lines are ignored
- **AND** the game continues running

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

### Requirement: Browser AI Status

Campsite Empire v2 MUST make local AI usage visible in the UI.

#### Scenario: AI call succeeds

- **GIVEN** a configured local AI provider returns valid JSON
- **WHEN** the game uses the response
- **THEN** the AI status UI shows a successful local provider call

#### Scenario: AI fallback is used

- **GIVEN** the local AI provider is unavailable, blocked, times out, or returns invalid JSON
- **WHEN** the game uses a template fallback
- **THEN** the AI status UI increments fallback count
- **AND** shows the latest fallback reason

### Requirement: Browser Local Model Compatibility

Campsite Empire v2 MUST support browser calls to local model tools when permitted by the provider and browser.

#### Scenario: llama.cpp chat completions endpoint is configured

- **GIVEN** `VITE_CAMPSITE_AI_PROVIDER=llamacpp`
- **AND** `VITE_CAMPSITE_AI_URL` points to an OpenAI-compatible chat completions endpoint
- **WHEN** AI content is requested
- **THEN** the browser client sends a `messages`-based request
- **AND** parses the returned assistant message content as structured JSON

#### Scenario: Browser blocks provider request

- **GIVEN** the configured provider rejects or blocks browser requests
- **WHEN** an AI call fails
- **THEN** the game records the failure reason
- **AND** uses the matching template fallback

