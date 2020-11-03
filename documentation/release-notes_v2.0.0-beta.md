# Release v2.0.0-beta

Lots of changes in version 2. Most noteably a new data model and restructured front end components.

## What's new

### Introducing KPIs

_Key performance indicators_ (KPIs) can now be registered and tracked in the OKR tracker. There are three categories for which KPIs can be added to organisations, departments and products. Each KPI must be paired with a cell in a shared Google Sheets document containing its value.

### Access requests

Users who are not _whitelisted_ may now ask permission to gain access to the system. They must submit their email address, which will be registered to a separate Firestore collection. A Cloud function will trigger a message to the connected Slack channel where system administrators can grant or deny their request directly.

### Weighted objectives and key results

All objectives and key results now contains a _weight_ property for which administrators or team members may customise the weight. The weight of an object affects how progression is calculated. Objectives' weights affects their period's overall progression and the weights of key results affect their parent objective's progression.

### Improved development experience

It is now easier to get started setting up a new instance of the OKR Tracker or contributing to an existing Firebase project, due to improved documentation and simpler and better routines in regards to local mock data and development environment.

### Progression is handled on server

There are now Firestore Cloud functions that monitor CRUD operations to periods, objectives, key results, and their progressions, and automatically handling updating progression for the affected objects.

### Firestore rules

Version 2.0.0 introduces better security. All documents in Firestore is now protected by database rules dictating read, write, and delete permissions based on document type and the user attempting to perform the action.

### Move products, objectives and key results

It is now possible to move a product from one department to another. There also support for moving objectives and key results to different periods and objective respectively.

### Save view preferences

Users' view preferences are stored in the database each time they make a change to their view (including minimize/expand widgets).

### Audit logging on server

All CRUD events are audited and stored by Cloud functions containing the affected object, the performing user and a timestamp. Updates include the before and after values.

## Changed

- Several user interface changes
- More constitent styles and visual design
- Dashboard view available for organisations and departments
- Improved responsive design

## Removed

- Audit feed
- Images for organisations, departments and products
