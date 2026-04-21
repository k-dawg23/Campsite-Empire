# ai Specification

## Purpose

Define how Campsite Empire configures local AI providers and keeps AI features reliable through deterministic fallback behavior.
## Requirements
### Requirement: .env AI Configuration

The game MUST support configuring local AI provider settings from a `.env` file.

#### Scenario: .env file configures local AI

- **GIVEN** a `.env` file contains `CAMPSITE_AI_PROVIDER`, `CAMPSITE_AI_URL`, and `CAMPSITE_AI_MODEL`
- **AND** matching OS environment variables are not set
- **WHEN** the AI service initializes
- **THEN** the game uses the `.env` values for local AI configuration

#### Scenario: Missing .env file uses defaults and fallback behavior

- **GIVEN** no `.env` file is available
- **AND** no OS environment variables are set for AI configuration
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
