## 1. Tutorial modal

- [x] Add six tutorial steps covering concept/goal, building, tourist selection, pricing, weather/seasons, and AI features.
- [x] Render a modal on first visit when the tutorial localStorage flag is absent.
- [x] Include a title and description for each step.
- [x] Include Next and Skip buttons on each step.
- [x] Include a visible progress indicator on each step.
- [x] Mark the tutorial as seen when skipped or completed.
- [x] Ensure the tutorial does not automatically reopen after it has been seen.

## 2. Help entry point

- [x] Add a Help button in the stats bar.
- [x] Reopen the tutorial when Help is clicked, even if it was previously seen.
- [x] Keep the Help button responsive with the existing stats bar layout.

## 3. Version and tests

- [x] Bump app/package version metadata to `2.0.4`.
- [x] Add or update UI tests for first-visit tutorial display.
- [x] Add or update UI tests for Next/progress behavior.
- [x] Add or update UI tests for Skip persistence.
- [x] Add or update UI tests for Help reopening.

## 4. Verification

- [x] Run unit/UI tests.
- [x] Run production build.
- [x] Run OpenSpec validation.
