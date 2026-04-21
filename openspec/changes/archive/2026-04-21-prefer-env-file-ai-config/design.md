# Design Notes: .env AI Configuration

## File Locations

The implementation should check predictable locations in order:

1. Project root `.env` while running from the Godot editor.
2. Executable-adjacent `.env` for exported desktop builds.
3. Godot `user://.env` as a user-specific fallback.

Exact path handling may vary by platform, but the README must explain where the game looks.

## Precedence

Configuration resolution must prefer explicit OS environment variables over file values:

1. OS environment variable.
2. First discovered `.env` file value.
3. built-in default.

This lets shell-based workflows override local files without editing them.

## Parser

The parser should support:

- Empty lines.
- Comment lines starting with `#`.
- `KEY=value`.
- Optional single or double quotes around values.
- Trimming surrounding whitespace.

The parser does not need to support shell expansion, multiline values, command substitution, or `export KEY=value`.

## Safety

Invalid lines should be ignored. Missing `.env` files should be normal and should not log scary errors. AI fallback behavior must remain the reliable default when no usable provider is configured.
