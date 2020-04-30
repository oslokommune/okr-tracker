# Connecting to an existing Firebase project

Follow this guide to complete the set up for your local development environment and deploy your application.

## Application environment variables

Grab the project parameters from Settings page on Firebase. Under 'General' and 'Your apps', select 'Config' under 'Firebase SDK snippet' and take note of the `firebaseConfig` object displayed.

Create an `.env.local` file (and an `.env.production` file if you intend to deploy to production) in the root directory and add the following secrets:

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

## Automated Backup with Cloud Functions

To set up automated backups, please read the [Setting up Automated backups](/documentation/automated-backups.md) guide.

If you do not want to have automated backups then you need to delete or comment out the code inside `functions/index.js`

```javascript
/**
 * Functions for backup and restoring the Firestore database
 */
exports.automatedBackups = automatedBackups();
exports.automatedRestore = automatedRestore();
```

## Setting up Firebase environment variables

Firebase need certain environment variables for its Cloud Functions, namely for fetching data from Google Sheets (used for _automatically updating key results_).

- Navigate to your [Firebase project](http://console.firebase.google.com/)
- From the Project Overview, select 'Service accounts'
- Click 'Generate new private key'

Then run the following command using your new key

```
firebase functions:config:set
  sheets.email="<service account email>"
  sheets.key="<service account private key>"
```

**Note: The private key string needs to have actual line breaks as opposed to `\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

Additionally, if you want to add automated backups and restore then you must set up environment variables for Firebase Functions:

```
firebase functions:config:set storage.bucket="<bucket name>"
```

# Project setup

```
npm install
```

## Compiles and hot-reloads for development

```
npm run serve
```

## Compiles and minifies for production

```
npm run build
```

## Deploy

Deploys project to production environment

```
npm run deploy
```

Deploys to development environment

```
npm run deploy:dev
```

## Lints and fixes files

```
npm run lint
```

```
npm run lint:style
```

```
npm run lint:style:fix
```
