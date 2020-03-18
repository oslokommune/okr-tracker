# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2020-03-18

### Added

- Visualising members of a department as a network graph
- Localization for nb-no with vue-i18n

### Changed

- Refactor all Cloud Functions
- Better documentation (jsdoc) for all Cloud Functions
- Show progress next to an _objective_ also when it's empty (0%)

### Fixed

- Fix bug where progression for objectives and periods did not get updated when a new (empty) key result was created
- Hide dashboard view for departments and organisations
- Fix error logged when toggling archived documents on admin panel

## [1.2.0] - 2020-03-11

OKRs are now supported on _organisation_ level. This will allow administrators to create and manage details (name, mission statement), objectives and key results for organisations.

_Organisations_ will work in a similar fashion as departments and products, whereas the child departments will be displayed on an organisation’s page. Please note that creating and/or deleting organisations is not included in this version.

### What’s new

- OKRs for organisation level
- Character limits for user inputs

### Added

- OKRs for organisation level
  - Edit existing organisations from the admin panel
  - Page to view organisations under route `/organization/<slug>`
  - Manage objectives and key results for organisation at `/organization/<slug>/edit`
  - Cloud functions to handle progression for organisation
- Supporting Markdown for mission statements

### Changed

- Convert the organisation in breadcrumbs to a link
- Use `placeholder-image.svg` instead of `placeholder-user.svg` for departments and products that do not have an image
- Consistently use American `organization` instead of `organisation` as function and variable names
- Reduce font weight on table of contents on help page
- Limit character count on various user inputs
  - `profile/displayName` <= 32 char
  - `organization/name` <= 64 char
  - `department/name` <= 64 char
  - `product/name` <= 64 char
  - `period/name` <= 12 char
  - `objective/description` <= 320 char
  - `objective/name` <= 160 char
  - `missionStatement` <= 320 char
  - `keyResult/description` <= 120 char
  - `keyResult/unit` <= 32 char
- Improved design on members and products lists (include name next to its image)
- Improved content on `help.md`
  - Managing products
  - Managing organisations
  - Managing dynamic periods
- Reduce size of image preview on forms for editing organisations, departments and products
- Visualise the (positive or negative) change on the newsfeed card for updating progress on a key result

### Deprecated

**Migrating data from Google Sheets:** Functionality for migrating data from Google Sheets should no longer be necessary. The scripts for handling this will remain in the codebase for now, but will soon be removed. The description and file upload will be removed in the UI.

### Removed

- Form for migrating data from Google Sheets

### Fixed

- Fix JSDoc errors in `db.js`

## [1.1.0] - 2020-03-09

This release introduces _dynamic date periods_ that replace static annual quarters for objectives. This means that custom date periods need to be manually created on each department and product onwards.

Under the ‘Danger Zone’ section on the admin view there is an action that automates the convertion of currently existing objecties onto dyamic date periods. This should only be triggered **once** in production after release of this version to prevent data loss.

This change adds a `/periods` subcollection on the `departments` and `products` collections that holds the details for the periods as well as the _progression_ for that period.

### Added

- Show callout to team members when a product image is missing
- Documentation for managing departments on Help page
- Automated backup of the firebase database
- Automated restore of backup for the firebase database

### Changed

- Converting static annual quarters to dynamic and custom date periods
  - Users can now create unlimited future (and past) periods
  - Users must give name date periods
  - Navigating between periods using URL query parameters
  - Adjustments in Cloud Functions to handle progression for dynamic periods
- Refactoring some Firestore handling – introducing the `serializeList` function to make the codebase a bit more DRY.
- Hide progress visualisation when department or product does not have any objectives

### Removed

- Legacy dashboard component

### Fixed

- Fix issue where progress graphic did not always update when navigating between pages
- Force the submenu to appear even when no periods are available
- Minor layout adjustment on the page header (less white space below page name on desktop)
- Allow floating point numbers as key result progress
- Replace _ninjas_ with _cubes_ when a department has zero products

## [1.0.2] - 2020-02-25

### Changed

- Upgrade dependencies

## [1.0.1] - 2020-02-24

### Added

- Table of contents on help page
- CHANGELOG.md

### Changed

- Fixed misleading text on help page for updating profile image
- Hide notes on key result page for non-members
- Improve styling of line chart (gradient fill)
- Increase size and quality for uploaded images
- Updated event-types.md with correct data

### Fixed

- Navigating to products/departments didn’t load the correct data
- Updating/changing a migrated key results

## [1.0.0] - 2020-02-21

First official release.
