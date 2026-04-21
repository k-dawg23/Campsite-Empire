# Change Proposal: Prefer .env File for AI Configuration

## Summary

Update Campsite Empire so local AI provider settings are preferably loaded from a project/user `.env` file, while still allowing OS environment variables as an override path. This makes local AI setup easier for players and developers who launch the game through Godot or a desktop build instead of a terminal.

## Problem

The current AI configuration is documented as OS environment variables:

- `CAMPSITE_AI_PROVIDER`
- `CAMPSITE_AI_URL`
- `CAMPSITE_AI_MODEL`

That works when launching from a shell, but it is awkward for users who start Godot from a launcher, run exported desktop builds, or do not want to manage persistent system-level environment variables. A `.env` file is simpler, more discoverable, and easier to copy between local setups.

## Goals

- Prefer `.env` file configuration for local AI provider settings.
- Keep OS environment variables supported so advanced users and CI/dev shells still work.
- Define clear precedence between OS variables, `.env`, and defaults.
- Document a sample `.env` file for Ollama and other local providers.
- Avoid storing secrets in source control by ignoring local `.env` files.

## Non-Goals

- Adding a full in-game settings screen for AI provider configuration.
- Supporting encrypted secret storage.
- Requiring a local AI provider for gameplay.
- Removing the existing template-based AI fallback behavior.

## Proposed Approach

1. Add a lightweight `.env` loader that reads key/value pairs from a local `.env` file at startup.
2. Support comments, blank lines, optional quotes, and simple `KEY=value` syntax.
3. Resolve AI settings using this precedence:
   - OS environment variable when set.
   - `.env` value when present.
   - built-in default.
4. Add `.env.example` with common local AI settings.
5. Add `.env` to `.gitignore`.
6. Update README documentation to recommend `.env` for local setup.

## Impact

### Player/Developer UX

- Local AI setup becomes a file edit instead of shell-specific configuration.
- Exported builds can use a nearby `.env` file without requiring users to launch from a configured terminal.

### Technical

- AI service construction gains a small configuration dependency.
- Existing fallback behavior remains unchanged when no provider is configured or when provider calls fail.

## Risks

- `.env` file location needs to be predictable across editor and exported builds.
- Invalid `.env` syntax should not crash the game.
- Local `.env` files may contain private endpoint details and should not be committed.
