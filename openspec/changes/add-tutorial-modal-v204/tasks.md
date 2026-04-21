## 1. Tutorial modal

- [ ] Add six tutorial steps covering concept/goal, building, tourist selection, pricing, weather/seasons, and AI features.
- [ ] Render a modal on first visit when the tutorial localStorage flag is absent.
- [ ] Include a title and description for each step.
- [ ] Include Next and Skip buttons on each step.
- [ ] Include a visible progress indicator on each step.
- [ ] Mark the tutorial as seen when skipped or completed.
- [ ] Ensure the tutorial does not automatically reopen after it has been seen.

## 2. Help entry point

- [ ] Add a Help button in the stats bar.
- [ ] Reopen the tutorial when Help is clicked, even if it was previously seen.
- [ ] Keep the Help button responsive with the existing stats bar layout.

## 3. Version and tests

- [ ] Bump app/package version metadata to `2.0.4`.
- [ ] Add or update UI tests for first-visit tutorial display.
- [ ] Add or update UI tests for Next/progress behavior.
- [ ] Add or update UI tests for Skip persistence.
- [ ] Add or update UI tests for Help reopening.

## 4. Verification

- [ ] Run unit/UI tests.
- [ ] Run production build.
- [ ] Run OpenSpec validation.
