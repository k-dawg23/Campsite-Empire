# React Client Capability

## ADDED Requirements

### Requirement: Player-Facing Header Hides Technical Metadata

The player-facing header MUST present the game title without visible version number or implementation stack details.

#### Scenario: Header shows game identity only

- **GIVEN** the player opens Campsite Empire
- **WHEN** the header renders
- **THEN** the title area shows `Campsite Empire`
- **AND** the title area does not show the app version number
- **AND** the title area does not show implementation stack details such as React, TypeScript, Redux, or Tailwind
