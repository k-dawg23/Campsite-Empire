# Change Proposal: Improve Persistence Controls and Header Title

## Version

Target version: `2.0.3`

## Why

Campsite Empire already has an IndexedDB autosave baseline, but the current implementation saves on a 3.5 second interval, has no manual Save or Load controls, and New Game clears saved data immediately. Players need clearer save agency and stronger protection before deleting a campground.

The header also shows implementation/version details next to the game title. That information is useful to developers, but it is not relevant to normal play and makes the game feel less polished.

## What Changes

- Persist the full game state to IndexedDB as the primary save system.
- Autosave the full game state every 2 seconds after state changes.
- Automatically restore the last saved IndexedDB state on page load.
- Persist speed separately in `localStorage` so the selected speed survives even if IndexedDB restore is delayed.
- Add player-facing Save, Load, and New Game buttons.
- Require double-confirmation before New Game clears IndexedDB, localStorage speed, and current state.
- Remove version number and stack details from the title/header area.
- Bump app version metadata to `2.0.3` when applied.

## Goals

- Make saves predictable and visible to the player.
- Reduce save latency after meaningful state changes.
- Preserve speed preference independently from full save hydration.
- Prevent accidental campground deletion.
- Keep the header focused on the game, not implementation metadata.

## Non-Goals

- Cloud saves or account-based sync.
- Multiple named save slots.
- Export/import save files.
- Changing save schema content beyond what is needed for v2.0.3.
- Removing version metadata from package files, README, or internal state.

## Proposed Approach

1. Keep the existing IndexedDB save layer and adjust autosave cadence/state-change detection to save after at most 2 seconds.
2. Add explicit Save and Load actions in the UI that call the IndexedDB save layer and report success/failure in the game status area.
3. Store `game.speed` in `localStorage` whenever it changes and apply that speed early on load, separately from IndexedDB hydration.
4. Update New Game to require two deliberate confirmations before clearing saved data and resetting state.
5. Remove the visible `vX · React + TypeScript + Redux` subtitle from the header.
6. Update tests for autosave cadence, manual controls, speed persistence, and header content.

## Risks

- Autosaving every 2 seconds could write more often than necessary if state changes constantly.
- Speed restoration must avoid fighting with IndexedDB hydration.
- Double-confirmation should be clear without becoming irritating during intentional resets.
- Existing tests may rely on version text in the header and need updates.
