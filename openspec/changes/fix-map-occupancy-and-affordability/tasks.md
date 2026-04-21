## 1. Occupied map overlay

- [ ] Reposition occupied plot markers so they overlay the same grid square as the occupied tent site, campervan spot, or RV hookup image.
- [ ] Ensure occupied markers render in front of, not behind, the structure image.
- [ ] Keep the underlying structure type visually identifiable while occupied.
- [ ] Add or update accessibility labels/test ids for occupied plot visuals.
- [ ] Add or update UI tests covering occupied marker placement semantics.

## 2. Build affordability

- [ ] Disable Build panel items when current cash is less than the item build cost.
- [ ] Apply a distinct unavailable color/style to unaffordable Build panel items.
- [ ] Prevent unaffordable Build panel items from becoming the selected build item.
- [ ] Keep affordable Build panel items selectable.
- [ ] Add or update UI tests covering unaffordable and affordable build item states.

## 3. Version and verification

- [ ] Bump app/package version metadata to `2.0.2`.
- [ ] Run unit/UI tests.
- [ ] Run production build.
- [ ] Run OpenSpec validation.
