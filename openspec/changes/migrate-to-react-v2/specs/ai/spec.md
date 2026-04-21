# AI Capability

## MODIFIED Requirements

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

## ADDED Requirements

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
