# Setting up Firebase

**Follow this guide to set up a new clean instance of the OKR-tracker.**

- Create a [Google Firebase](https://firebase.google.com) project.
- Install the Firebase CLI and [initialize the project](https://firebase.google.com/docs/cli).
- Create a Google service account
  - From the Project Overview, select 'Service accounts'
  - Click 'Generate new private key'

This key is used for fetching data from Google Sheets (for [automatically updating key results](automatically-updating-key-results.md)). In order to fetch data from Google Sheets, you must set up environment variables for Firebase Functions:

```
firebase functions:config:set
  sheets.email="<service account email>"
  sheets.key="<service account private key>"
```

**Note: The private key string needs to have actual line breaks as opposed to `\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

If you want to add automated backups and restore then you must set up environment variables for Firbase Functions:

```
firebase functions:config:set storage.bucket="<bucket name>"
```

**Note: The private key string needs to have actual line breaks as opposed to `\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

## Application environment variables

Grab the project parameters from Settings page on Firebase. Under 'General' and 'Your apps', select 'Config' under 'Firebase SDK snippet' and take note of the `firebaseConfig` object displayed. Some of these values need to be included in your env-file.

## Setting up the Firebase Firestore

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

## Enable Google Auth in Firebase

We use Google Auth to authenticate users and this needs to be enable in the Firebase Console.

- Navigate to your project in Firebase console
- Press the `Authentication`-button in the side menu
- `Sign-in Method`-tab
- Enable Google Auth

Next, proceed to [Connecting to an existing firebase project](connecting-to-existing-firebase.md) for our guide to setting up your environments.
