# Change Proposal: Fix Occupancy Overlay and Build Affordability

## Version

Target version: `2.0.2`

## Why

The v2.0.1 map visuals improved structure readability, but the occupied guest marker can appear offset into the neighboring grid square instead of sitting on top of the occupied plot. This makes it look like the tourist belongs to the wrong tile.

The Build panel also allows players to select structures they cannot currently afford. Since placement will fail after selection, the panel should communicate affordability up front and prevent invalid build selections.

## What Changes

- Move occupied-state indicators for tent sites, campervan spots, and RV hookups so they overlay the occupied structure image on the same grid square.
- Ensure the occupied marker renders in front of the structure image without hiding the structure type.
- Change unaffordable Build panel items to use a disabled/unavailable visual state.
- Prevent unaffordable Build panel items from being selected.
- Keep affordable Build panel items selectable with existing placement behavior.
- Bump the app version to `2.0.2` when the change is applied.

## Goals

- Make occupied plots visually unambiguous.
- Keep structure images identifiable when occupied.
- Give immediate build affordability feedback before tile selection.
- Avoid wasted clicks when the player lacks enough money.

## Non-Goals

- Changing build costs or economy balance.
- Adding loans, financing, warnings, or new money systems.
- Replacing the current inline SVG structure visuals.
- Changing valid terrain or placement rules.

## Proposed Approach

1. Reposition the occupied guest marker using the occupied structure's own tile center.
2. Render the marker after the structure image in the same SVG group so it layers in front.
3. Add accessible labels or test selectors that verify the marker belongs to the occupied structure visual.
4. Update Build panel button logic to calculate `canAfford` from current cash and each item's build cost.
5. Disable unaffordable buttons and apply a distinct unavailable style.
6. Guard selection so unaffordable build items cannot become the active build choice.
7. Add UI tests for occupied marker placement semantics and unaffordable build items.

## Risks

- Occupied overlays could obscure small structure visuals if too large.
- Disabled styling needs enough contrast without looking like a selected state.
- Existing tests that query build buttons may need updates because disabled buttons remain visible but no longer clickable.
