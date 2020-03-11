# okr-tracker

## Getting started

### Setting up Firebase

- Create a [Google Firebase](https://firebase.google.com) project.
- Install the Firebase CLI and [initialize the project](https://firebase.google.com/docs/cli).
- Create a Google service account
  - From the Project Overview, select 'Service accounts'
  - Click 'Generate new private key'

In order to fetch data from Google Sheets, you must set up environment variables for Firebase Functions:

```
firebase functions:config:set
  sheets.email="<service account email>"
  sheets.key="<service account private key>"
```

If you want to add automated backups and restore then you must set up environment variables for Firbase Functions:
```
firebase functions:config:set storage.bucket="<bucket name>"
```

**Note: The private key string needs to have actual line breaks as opposed to `\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

### Application environment variables

Grab the project parameters from Settings page on Firebase. Under 'General' and 'Your apps', select 'Config' under 'Firebase SDK snippet' and take note of the `firebaseConfig` object displayed.

Create a `.env.production` file with the following secrets:

| Secret                        | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `VUE_APP_DASHBOARD_USER`      | Any (even made-up) email-address to authorize 'dashboard users' |
| `VUE_APP_API_KEY`             | _details from firebaseConfig_                                   |
| `VUE_APP_AUTH_DOMAIN`         | _details from firebaseConfig_                                   |
| `VUE_APP_DATABASE_URL`        | _details from firebaseConfig_                                   |
| `VUE_APP_PROJECT_ID`          | _details from firebaseConfig_                                   |
| `VUE_APP_STORAGE_BUCKET`      | _details from firebaseConfig_                                   |
| `VUE_APP_MESSAGING_SENDER_ID` | _details from firebaseConfig_                                   |
| `VUE_APP_APP_ID`              | _details from firebaseConfig_                                   |
| `VUE_APP_MEASUREMENT_ID`      | _details from firebaseConfig_                                   |

### Setting up the Firebase Firestore

The Firebase Database must be set to Firestore, and needs a few values to get up and running.

Manually insert the following values to the database.

- `/orgs/<new document>`
  - `name: 'My Organisation Name`
  - `archived: false`
  - `missionStatement: 'My Mission Statement'`
- `/users/<new document>` (ID must be your email address)
  - `admin: true`
  - `slug: 'MySlug'`
- `/users/<new document>` (ID must be the same as the dashboard user's email address)
  - `admin: false`
  - `slug: 'MyDashboardUserSlug'`

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Deploy

Deploys project to production environment

```
npm run deploy
```

Deploys to development environment

```
npm run deploy:dev
```

### Lints and fixes files

```
npm run lint
```

```
npm run lint:style
```

```
npm run lint:style:fix
```
