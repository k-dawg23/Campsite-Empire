# Change Proposal: Add First-Visit Tutorial Modal

## Version

Target version: `2.0.4`

## Why

Campsite Empire now has enough systems that a new player can land in the management screen without knowing what to do first. A concise onboarding flow should explain the goal, the major systems, and how AI-driven tourists interact with the campground. The player should see it automatically once, and be able to reopen it later from the main stats/header area.

## What Changes

- Add a multi-step tutorial modal that appears on first visit.
- Track whether the tutorial has been seen in `localStorage`.
- Add a `Help` button in the stats bar that reopens the tutorial at any time.
- Include six tutorial steps:
  1. Game concept and goal.
  2. Building plots and facilities.
  3. How tourists arrive and choose plots.
  4. Pricing strategy.
  5. Weather and seasons.
  6. AI features.
- Each tutorial step has a title, description, Next button, Skip button, and progress indicator.
- Bump app version metadata to `2.0.4` when applied.

## Goals

- Help first-time players understand what Campsite Empire is asking them to do.
- Make the major simulation systems discoverable without cluttering the main screen.
- Allow returning players to reopen guidance through Help.
- Avoid showing the tutorial automatically after the player has skipped or completed it.

## Non-Goals

- Adding interactive guided highlights or forced clicks.
- Blocking normal gameplay after the tutorial is dismissed.
- Adding remote documentation or external help links.
- Changing simulation rules, AI behavior, or economy balance.

## Proposed Approach

1. Add tutorial step data in the React UI or a small UI helper module.
2. On app load, read a stable localStorage key such as `campsite-empire-tutorial-seen`.
3. Show the tutorial modal automatically when the key is absent.
4. Mark the key when the player skips or completes the tutorial.
5. Add a compact Help button alongside the existing stats bar controls that opens the modal without changing the seen flag semantics.
6. Render modal controls with accessible labels, keyboard-friendly buttons, and a visible progress indicator such as `Step 2 of 6`.
7. Add UI tests for first-visit behavior, Skip persistence, Next/progress behavior, and Help reopening.

## Risks

- The modal could feel intrusive if it appears before the main view is ready.
- Tutorial text needs to be concise enough that it helps without becoming a manual.
- The Help button must fit the stats bar responsively without crowding current metrics.
