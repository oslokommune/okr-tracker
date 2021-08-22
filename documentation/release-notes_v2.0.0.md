# Release v2.0.0

Lots of changes have been done within the beta and RC stages of OKR-tracker.

We will list the most noticeable changes here, but check out the whole changelog for an expanded list of changes.

## BREAKING CHANGES

- Drop IE11 Support
- Service account private key is not optional
- Changes to environment variables
- Dropped support for Node < 14.x
- Required Node >= 14.x

### Added

- 3 different themes
- English locale
- Keycloak integration
- Access to Team Drives for service accounts (if strict domain policy is enabled)
- Collapse rows of organizations and departments on the front page - save to user objects (everyone starts with collapsed)
- CRUD API for requestAccess and creation of users
- Cloud Functions: CRUD API for KPI and Key Results. It is now possible to call an end point if you want to update progress through the API and not through the frontend. Locked behind API Gateway with API key, get in contact to get a key.
- API Gateway: added gateway for users to call if they want access to API for KPI and Key Results. Needs API Key from us, contact us to get a key for your own team
- Swagger doc: read more about the new open API end points at https://okr.oslo.systems/api
- Meta-tags for fb/twitter/open graph
- Robots.txt
- Add dart-sass support

### Changed

- Several user interface changes
- More consistent styles and visual design
- List of Organizations/Departments/Products are sorted alphabetically
- Drop node-sass support

### Fixed

- Multiple bugs with logins and infinite spinners
- Graphs handling high numbers
