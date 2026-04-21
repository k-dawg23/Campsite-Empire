# AI JSON Schemas

The AI layer requests one JSON object and parses the first complete object in the response. Any missing field, invalid type, timeout, provider error, or unsafe value falls back to the template implementation.

## Tourist Generation

```json
{
  "name": "string",
  "personality": "string",
  "budget": 45,
  "preferred_plot": "TentSite",
  "likes_facilities": ["Restroom", "FirePit"],
  "dislikes_nearby": ["Playground"],
  "likes_quiet": true,
  "likes_water": false,
  "stay_nights": 2
}
```

Allowed `preferred_plot` values: `TentSite`, `CampervanSpot`, `RvHookup`.

## Plot Selection

```json
{
  "stay": true,
  "selected_plot_id": "00000000-0000-0000-0000-000000000000",
  "reason": "This plot fits the tourist budget and preferences."
}
```

`selected_plot_id` may be null or omitted when `stay` is false.

## Chatter

```json
{
  "mood": "content",
  "text": "The facilities are close enough that this feels easy."
}
```

The game attaches tourist id, day, hour, and display name.

## Review

```json
{
  "stars": 4,
  "text": "A relaxing stay with fair pricing and good facilities.",
  "tags": ["value", "facilities"]
}
```

`stars` is clamped to the range 1-5.
