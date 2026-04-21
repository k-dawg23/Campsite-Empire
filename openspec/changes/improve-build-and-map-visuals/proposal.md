# Change Proposal: Improve Build Palette and Map Structure Visuals

## Why

The current Build panel shows nightly pricing for plot types, which makes the build action ambiguous because clicking those buttons spends build cost, not nightly price. The map also represents structures as circles with letters, which reads like a prototype marker rather than a game object. Occupied rentable plots are not visually distinct enough at map level.

## What Changes

- Change the Build panel so every buildable item displays its build cost.
- Keep nightly pricing visible only in the pricing controls, inspector, or other economy-focused UI.
- Replace letter-in-circle map markers with recognizable item visuals for tent sites, campervan spots, RV hookups, restrooms, showers, fire pits, playgrounds, and camp stores.
- Add occupied-state visuals for tent sites, campervan spots, and RV hookups so the player can see which plots are in use directly on the grid.

## Goals

- Make the Build panel accurately communicate construction cost.
- Make the isometric grid feel more like a game board and less like a debug overlay.
- Let players identify structure types without decoding abbreviations.
- Let players distinguish vacant and occupied rentable plots at a glance.
- Preserve existing placement, inspector, pricing, and simulation behavior.

## Non-Goals

- Reworking economy balance.
- Changing plot nightly prices.
- Adding new structure types.
- Replacing the entire map renderer.
- Introducing external image asset dependencies.

## Proposed Approach

1. Update Build panel labels to use `buildCost` for all buildable items.
2. Add SVG-based structure icons or inline SVG symbol components for all current structure types.
3. Render those visuals on the isometric map instead of circular text labels.
4. Add a visible occupancy treatment for occupied plots, such as a guest badge, lit tent/RV detail, check-in marker, or small person/luggage overlay.
5. Update UI tests to assert build costs are shown for plot build buttons.
6. Add or update component tests for occupied map visuals where practical.

## Risks

- SVG icons may clutter the isometric map if they are too large or visually noisy.
- Occupancy indicators need enough contrast against terrain without hiding the structure visual.
- Text alternatives and test selectors should remain stable even if the visual design changes later.
