# Design Notes: v2.0.2 Occupancy and Affordability Fixes

## Occupancy Overlay

Occupied rentable plots should read as one object: the structure image plus an in-front guest marker. The marker should be anchored from the same tile center as the structure image, not pushed far enough to appear in an adjacent diamond. A small badge near the upper-right of the structure image is acceptable as long as it remains inside the visual footprint of the same tile.

The map should continue to use SVG so the overlay can share the same coordinate system as the structure art. The occupied group should expose stable accessibility text or test ids so automated tests can confirm the marker is attached to the occupied plot.

## Build Affordability

The Build panel should remain visible even when the player cannot afford some items. Unaffordable items should:

- Show their build cost.
- Use a distinct disabled visual treatment.
- Be disabled at the button level.
- Avoid changing the selected build item when clicked or activated.

If the currently selected build item later becomes unaffordable because the player spends money elsewhere, the UI should either clear that selection or prevent placement with clear feedback. The proposal prefers clearing or guarding selection at the panel/action level so the disabled state and selected state do not conflict.

## Versioning

The applied change should update package/app version metadata to `2.0.2`.
