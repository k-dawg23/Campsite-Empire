# Design Notes: Build and Map Visuals

## Build Palette

The Build panel represents construction actions, so the price shown beside each item should be `buildCost`. Plot nightly prices remain in the Prices panel and selected plot inspector.

## Map Structure Visuals

Prefer lightweight in-repo SVG or React SVG components over external image downloads. The visuals should be recognizable at small sizes:

- Tent Site: tent shape.
- Campervan Spot: van silhouette.
- RV Hookup: RV or hookup/power visual.
- Restroom: restroom building/toilet symbol.
- Shower: shower head/water visual.
- Fire Pit: fire ring/flame.
- Playground: slide/swing visual.
- Camp Store: small shop/storefront.

Use stable `aria-label` or `data-testid` attributes for structure visuals so tests and accessibility do not depend on decorative path details.

## Occupied Plots

Only rentable plot types need occupancy treatment:

- Tent Site.
- Campervan Spot.
- RV Hookup.

Occupied treatment should not replace the structure icon completely. It should augment it so the player can still identify the structure type and occupancy at once.
