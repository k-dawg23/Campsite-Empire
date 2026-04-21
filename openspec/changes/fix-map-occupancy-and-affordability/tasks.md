## 1. Occupied map overlay

- [x] Reposition occupied plot markers so they overlay the same grid square as the occupied tent site, campervan spot, or RV hookup image.
- [x] Ensure occupied markers render in front of, not behind, the structure image.
- [x] Keep the underlying structure type visually identifiable while occupied.
- [x] Add or update accessibility labels/test ids for occupied plot visuals.
- [x] Add or update UI tests covering occupied marker placement semantics.

## 2. Build affordability

- [x] Disable Build panel items when current cash is less than the item build cost.
- [x] Apply a distinct unavailable color/style to unaffordable Build panel items.
- [x] Prevent unaffordable Build panel items from becoming the selected build item.
- [x] Keep affordable Build panel items selectable.
- [x] Add or update UI tests covering unaffordable and affordable build item states.

## 3. Version and verification

- [x] Bump app/package version metadata to `2.0.2`.
- [x] Run unit/UI tests.
- [x] Run production build.
- [x] Run OpenSpec validation.
