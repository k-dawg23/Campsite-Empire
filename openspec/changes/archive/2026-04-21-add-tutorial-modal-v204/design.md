# Design Notes: v2.0.4 Tutorial Modal

## Modal Behavior

The tutorial should be a regular React Control-style modal layered over the existing game screen. It should not navigate away from the playable management view. On first visit, the modal opens once the app has mounted enough for localStorage to be available.

Dismissal rules:

- `Skip` closes the modal and marks the tutorial as seen.
- Completing the final step with `Next` closes the modal and marks the tutorial as seen.
- `Help` reopens the modal even if the tutorial was previously seen.

## Content

The tutorial should have six steps with player-facing language:

- Game concept and goal: manage a campground, earn money, improve reputation.
- Building plots and facilities: select build items and place them on valid tiles.
- Tourists: arrivals evaluate plots based on preferences, facilities, and price.
- Pricing strategy: adjust nightly prices to balance revenue and appeal.
- Weather and seasons: demand and satisfaction change with conditions.
- AI features: local AI can generate tourist personalities, choices, reviews, and chatter, with fallbacks.

## Controls

Every step should include:

- Title.
- Description.
- Progress indicator.
- `Next` button.
- `Skip` button.

On the final step, the `Next` button may say `Finish` if that feels clearer, but it still satisfies the Next action requirement.

## Persistence

Use localStorage for the seen flag because it is small, user-device scoped, and independent of IndexedDB game saves. Clearing or resetting the game should not necessarily clear tutorial seen state unless a future change explicitly adds that behavior.

## Accessibility

The modal should use dialog semantics (`role="dialog"` or equivalent), have an accessible title, and expose buttons through normal keyboard focus. Progress text should be visible, not only encoded visually.
