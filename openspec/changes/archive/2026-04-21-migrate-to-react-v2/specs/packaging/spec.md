# Packaging Capability

## REMOVED Requirements

### Requirement: Desktop Export Configuration

Campsite Empire v2 no longer uses Godot desktop export templates.

### Requirement: Build Documentation

Campsite Empire v2 replaces desktop build documentation with web build documentation.

## ADDED Requirements

### Requirement: Web Build

Campsite Empire v2 MUST provide a production web build.

#### Scenario: Developer builds v2

- **GIVEN** dependencies are installed
- **WHEN** the developer runs the documented build command
- **THEN** static production assets are generated

### Requirement: v2 Release Version

Campsite Empire v2 MUST use version `2.0.0`.

#### Scenario: Version metadata is visible

- **GIVEN** the v2 project has been migrated
- **WHEN** version metadata is inspected
- **THEN** it reports `2.0.0`

### Requirement: v2 Release Tag

The implemented migration MUST be tagged as `v2.0.0`.

#### Scenario: Release is published

- **GIVEN** the v2 migration has been implemented and verified
- **WHEN** the release is pushed to GitHub
- **THEN** the repository includes a `v2.0.0` Git tag pointing at the release commit
