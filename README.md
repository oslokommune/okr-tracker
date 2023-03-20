# OKR Tracker

- [OKR Tracker](#okr-tracker)
  - [Demo](#demo)
  - [Project requirements](#project-requirements)
  - [Clone and install](#clone-and-install)
  - [Set up new instance](#set-up-new-instance)
    - [Create Firebase project](#create-firebase-project)
      - [Enable Google Auth in Firebase](#enable-google-auth-in-firebase)
    - [Environment variables](#environment-variables)
    - [Link project](#link-project)
    - [Run locally](#run-locally)
  - [Make Firestore ready for production](#make-firestore-ready-for-production)
    - [Create mock data](#create-mock-data)
      - [Generate mock data](#generate-mock-data)
      - [Exporting mock data](#exporting-mock-data)
      - [Update mock data](#update-mock-data)
      - [Possible problems](#possible-problems)
  - [Create Google Cloud API Gateway](#create-google-cloud-api-gateway)
  - [Build and deploy](#build-and-deploy)
  - [Lint and fix](#lint-and-fix)
  - [Google Sheets integration](#google-sheets-integration)
  - [Import production data from Cloud Firestore to local Firestore](#import-production-data-from-cloud-firestore-to-local-firestore)
    - [Requirements](#requirements)
    - [Export production data](#export-production-data)
  - [Import production data](#import-production-data)
  - [Automated Backup with Cloud Functions](#automated-backup-with-cloud-functions)
    - [Requirements for automated backups](#requirements-for-automated-backups)
    - [Automated Restore with Cloud Functions](#automated-restore-with-cloud-functions)
  - [Slack Integration](#slack-integration)
    - [Set up](#set-up)
    - [Push audit log to slack channels](#push-audit-log-to-slack-channels)
  - [Supported providers](#supported-providers)
    - [Microsoft integration](#microsoft-integration)
    - [Google integration](#google-integration)
  - [Common problems](#common-problems)

## Demo

If you would like to check out how the application works, you can go to the demo-site and sign in with a test-user

- Site: https://origo-okr-tracker.web.app
- User/pass: testuser@okr.com / testuser

## Project requirements

- Node 16.x
- Firebase >=8.x (v9 is not supported)
- Firebase tools >9.x
- Firebase Blaze plan - Pay as you go

## Clone and install

Clone repository and run install:

```bash
npm install && cd ./functions && npm install && cd ..
```

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

## Set up new instance

Follow this guide to set up a new clean instance of the OKR-tracker. Please read the whole readme and not sequentially. There are some steps throughout the readme that are important to set up a new instance.

### Create Firebase project

- Create a [Google Firebase](https://firebase.google.com) project.
- [Initialize the project](https://firebase.google.com/docs/cli#initialize_a_firebase_project) with Firebase CLI
- Create a Google service account
  - From the **Project Overview**, select **Service accounts**
  - Click **Generate new private key**

This key is used for fetching data from Google Sheets (for automatically updating key results). In order to fetch data from Google Sheets, you must set up environment variables for Firebase Functions:

```bash
firebase functions:config:set
  service_account="<service account private key json-file>"
  storage.bucket="<your-storage-bucket-name>"
  slack.active=false
  slack.webhook="YOUR SLACK WEBHOOK HERE" (required if slack.active === true)
  slack.token="YOUR SLACK OAUTH TOKEN HERE" (required if slack.active === true)
  slack.host_url="HOST URL" (required if slack.active === true)
  sheets.impersonator="email-address" (optional)
```

Cat the whole service account private key json file into the environment key `service_account`.

```bash

zsh
firebase functions:config:set service_account="$(cat origo-okr-tracker-private-key.json)"

sh
firebase functions:config:set service_account="${cat origo-okr-tracker-private-key.json}"

```

**Note: The private key string needs to have actual line breaks as opposed to `\\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

We have Slack integrations. You can read about how to use the slack integration in the [slack section](#slack-integration).

If you want to activate them, then you would need to add it to the Firebase functions config. If you do not want to use the slack integrations, then you don't need to do anything.

```
firebase functions:config:set slack.active=true
```

#### Enable Google Auth in Firebase

We use Google Auth to authenticate users and this needs to be enabled in the Firebase Console.

**NOTE: This does not apply if you are only running this locally. We support Google and Microsoft as authentications**

- Navigate to your project in the [Firebase console](https://console.firebase.google.com/)
- Press the **Authentication**-button in the side menu
- **Sign-in Method**-tab
- Enable Google Auth

### Environment variables

Get your Firebase SDK snippet from your [Firebase Console](https://console.firebase.google.com/):

- Navigate to **Project settings**
- Under **Your apps**, find Firebase SDK snippet and press **Config**
- Copy the following secrets to a `.env.production` file in the root directory.
- Use also need `.env.local` to run this locally

| Secret                        | Description                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `VITE_API_KEY`                | _from SDK snippet_                                                                                         |
| `VITE_AUTH_DOMAIN`            | _from SDK snippet_                                                                                         |
| `VITE_DATABASE_URL`           | _from SDK snippet_                                                                                         |
| `VITE_PROJECT_ID`             | _from SDK snippet_                                                                                         |
| `VITE_STORAGE_BUCKET`         | _from SDK snippet_                                                                                         |
| `VITE_MESSAGING_SENDER_ID`    | _from SDK snippet_                                                                                         |
| `VITE_APP_ID`                 | _from SDK snippet_                                                                                         |
| `VITE_SHEETS_SERVICE_ACCOUNT` | \<service account email\>                                                                                  |
| `VITE_I18N_LOCALE`            | `nb-NO OR en-US`                                                                                           |
| `VITE_REGION`                 | `europe-west1`                                                                                             |
| `VITE_LOGIN_PROVIDERS`        | login providers allowed separated with hyphen - only implemented google, email. Ex: `google-email`         |
| `VITE_HOST_URL`               | URL which points to cloud functions that are set up as API CRUD endpoints                                  |
| `VITE_MICROSOFT_TENANT_ID`    | To limit the authentication to a certain TENANT, other wise everyone with a Microsoft account could log in |
| `VITE_ORGANIZATION`           | Name of the organization                                                                                   |

### Link project

```bash
firebase use --add
```

### Run locally

The local development environment uses [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) for Firestore and Cloud Functions. There is no need to do anything, only run the development script and everything is set up with a local user through Google auth.

Retrieve current Firebase environment configuration. This is needed for certain cloud functions to function locally.

```bash
firebase functions:config:get > ./functions/.runtimeconfig.json
```

Start Firebase emulators, import mock data and run the development server:

```bash
npm run dev
```

## Make Firestore ready for production

If you want to deploy to production or staging, you need to create multiple collections manually. Go to the Firestore Database in the [Firebase Cloud Console](https://console.firebase.google.com/)

- audit
- departments
- keyResults
- kpis
- objectives
- organizations
- periods
- products
- requestAccess
- slugs
- users
- domainWhitelist (optional)

The collection `users` needs one document with the first user. Create a document and add the following fields:

```json
{
  "id": "<email the user is signing in with",
  "email": "<email the user is signing in with",
  "superAdmin": true,
  "widgets": {
    "itemHome": {
      "children": true,
      "missionStatement": true,
      "progression": true,
      "team": true
    },
    "keyResultHome": {
      "details": true,
      "notes": true,
      "weights": true
    },
    "objectiveHome": {
      "details": false,
      "progression": true,
      "weights": true
    }
  }
}
```

### Create mock data

#### Generate mock data

After successfully logging in to the OKR Tracker, navigate to the [Admin panel](http://localhost:8080/admin). Here you can create new organisations, departments and products to use as your mock data. On each object you can also create periods, objectives, key results and KPIs.

#### Exporting mock data

To export your mock data run the following command:

```bash
firebase emulators:export ./mock_data
```

#### Update mock data

To update existing mock data, simply run the export command above and confirm overwrite existing export.

#### Possible problems

Firebase now exports storage emulator as well, even if you don't use it. These new folders are not checked into git because they are empty and git does not add empty folders. If you are a user that has problems running the mock data, you will need to add two folders to the `/mock_data/storage_export` folder. These are `blobs` and `metadata`.

## Create Google Cloud API Gateway

It is possible to set up open API end points for users outside of the OKR-tracker frontend to update progress of Key Results and KPI's. To do so, you only need to deploy all the functions as usual, and then give the users the Cloud Function URL, but we do not recommend to call the Cloud Function directly. The better approach would be to set up a Google Cloud API Gateway and then reroute all the calls to the right Cloud Function.

We have set up an OpenAPI specification which you can check out [here](./public/openapi.yaml).

You can read more about on how to set up an API Gateway [here](https://cloud.google.com/api-gateway/docs/quickstart).

The TL;DR is:

- Enable [required services](https://cloud.google.com/api-gateway/docs/quickstart#enabling_required_services)
- Create an API
- Create a new service account which has the correct access rights - we use the roles `APIGateway Admin` dsds `Cloud Functions Invoker`
- Create an API config
- Create a gateway

After an API Gateway has been set up, we have closed the gateway with an API Key, which means that you would need to create an API Key through the Google Cloud Console

If there are any questions regarding this, do not hesitate to get in contact with us and we will gladly help (i.e. create an issue)

## Build and deploy

Build and deploy to production:

```bash
npm run deploy
```

### Using GitHub Actions

To configure automatic deploy to Firebase Hosting on merge to `main` (triggered as part of the `pipeline.yml` workflow), add the following secrets to your GitHub repository:

- `ENV_FILE_PROD`: Contains a dumped copy of the production dotenv file.
- `FIREBASE_PROJECT_ID_PROD`: The Firebase Project ID.
- `FIREBASE_SERVICE_ACCOUNT_PROD`: Exported JSON key for a GitHub Actions specific service account created for deploying to Firebase Hosting.

See the [Firebase documentation](https://firebase.google.com/docs/hosting/github-integration) for steps required to create these secrets, either by using the Firebase CLI or [manually](https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md).

## Lint and fix

[ESlint](https://eslint.org) (including [Prettier](https://prettier.io/) configured to be executed as a linter rule) and [Stylelint](https://stylelint.io) are used for code formatting and linting. See configuration in the following files:

```
./.eslintrc.js
./.prettierrc.js
./.stylelintrc.js
```

```bash
npm run lint            # Run linter
npm run lint:fix        # Fix lint issues
npm run lint:style      # Run style linter
npm run lint:style:fix  # Fix lint issues found in styles
```

## Google Sheets integration

If you want to use Google Sheets API for automatic key results or automatic KPIs, you will need to enable the Google Sheets API in Google Cloud Console.

If you are using Team Drives with domain-policy (only specific domains have access) then you need to turn on domain-wide delegation on your service accounts and then give that service account access through G Suite Admin. Read more about it [here](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)

## Import production data from Cloud Firestore to local Firestore

Based on [this tutorial](https://medium.com/firebase-developers/how-to-import-production-data-from-cloud-firestore-to-the-local-emulator-e82ae1c6ed8) with a few differences for our use case.

The newest version of the OKR Tracker uses the Firebase Local Emulator Suite, where you can play and test your data without being afraid of production changes. It is still in the early stages, which means that auth is still handled by the cloud firebase and not locally.

When you start up the local Firestore emulator you can see that the Firestore is completely empty because we don't have any production data. This is an amazing way of working because you can do what ever you want without doing damages, but it's real life data that you most likely want to test and fix.

We are going to show you how you can export your production data to a GCP bucket or use an existing backed up bucket to import into your local Firestore.

### Requirements

```
- Firebase CLI
- Google Cloud SDK
```

How to install [Google Cloud SDK](https://cloud.google.com/sdk/install) and [Firebase CLI](https://firebase.google.com/docs/cli)

### Export production data

Login to Firebase and Google Cloud

```bash
firebase login
gcloud auth login
```

See the list of your projects and connect to the on you'd like to export data from:

```bash
firebase projects:list
firebase use <your project id>

gcloud projects list
gcloud config set project <your project id>
```

For the sake of this how to, we'll be using `okr-tracker-production` (production) for gcloud, and `origo-okr-tracker` (development) for the Firebase. The reason is that we use auth from our development Firebase instance, and not from the production instance.

If you don't already have automated backups of your production data, we will need to export the production data to a backup on GCP:

```bash
gcloud firestore export gs://okr-tracker-production.appspot.com/<backup-folder-name>
```

Now copy the new folder to your local machine, we are going to do this from our functions folder:

```bash
cd functions
gsutil -m cp -r gs://okr-tracker-production.appspot.com/<backup-folder-name> .
```

If you already have automated backups of your production data, you don't need to export the production data, only import it. For this application our backup folder is not part of the Firebase storage bucket:

```bash
gsutil -m cp -r gs://okr-tracker-backup/<YYYY-MM-DD>
```

## Import production data

To import the production data into your local Firebase emulator, you will need a metadata-file on the root folder, named `firebase-export-metadata.json`:

```json
{
  "version": "8.6.0",
  "firestore": {
    "version": "1.11.5",
    "path": "functions/<backup-folder-name>",
    "metadata_file": "functions/<backup-folder-name>/<backup-folder-name>.overall_export_metadata"
  }
}
```

Start your local Firebase emulator suite with the imported data. Firebase will read the metadata-json file automatically.

```bash
firebase emulators:start --import=./
```

## Automated Backup with Cloud Functions

We use cloud functions to backup our database every night and only keep backup of the last 14 days. If a backup is older than 14 days it gets automatically and permanently deleted from the storage bucket.

### Requirements for automated backups

- Firebase Blaze plan
- Set IAM Permission
- Manually create a storage bucket
- Cloud function

TLDR:

- Navigate to **Google Cloud Console** and choose your project
- Navigate to IAM & Admin - Your App Engine Service account needs the **Cloud Datastore Import Export Admin** role
- Navigate to **Storage** – Create a storage bucket – Give it a rule to delete storage that is >14 days old
- Run the command `firebase functions:config:set storage.bucket="<your-storage-bucket-name>"`

### Automated Restore with Cloud Functions

This is called automated restore but we still need to manually trigger a cloud function that does the restore from the Google Cloud Console

TLDR:

- From your Google Cloud Console navigate to **PubSub**
- Create a topic and name it 'restore-backup'
- Trigger the topic by publishing a message and the restore will be triggered

Gif of the process:

![Gif of the process src: thecloudfunction-blog](./documentation/recovery.gif)

Src/Citation: [The cloud function blog](https://thecloudfunction.com/blog/firebase-cloud-functions-recovery-backups/)

## Slack Integration

We have a slack integration that is connected with a couple of cloud functions.

There are two cloud functions that integrate with slack

1. `handleSlackRequest` - users requesting access - slack app posts to a channel that someone wants access
2. `handleSlackInteractive` - button actions from channel - user presses accept/reject/ignore and slack app posts to a cloud function that gives access to a user or rejects it

For these cloud functions to work you need to add a webhook url from a slack app.

### Set up

Firebase steps:

1. Open your gcloud console and go to IAM section
2. Give your Firebase account `Pub/Sub subscriber` role

Slack steps:

1. Go to slack application page and create a new app or go to your existing app
2. Activate `Incoming Webhooks` and create a new Webhook URL
3. Activate `Interactivity and Shortcuts` and add a new request URL which points to your Cloud Function

Copy the webhook URL and inject it into Firebase as an environment variable:

```bash
firebase functions:config:set slack.webhook="YOUR SLACK WEBHOOK HERE"

Request URL: https://<region>-<firebase-instance>.cloudfunctions.net/slackNotificationInteractiveOnRequest
```

### Push audit log to slack channels

We have added an integration with Slack, where a Slack user can subscribe to updates for an Organization, Department or Product.

If you have already set up a Slack integration from the previous point with Slack request and Slack interactive, you can go to the Slack commands site and add a new Slack command. We use `/okr` as a Slack command. Find you app [here](https://api.slack.com/apps)

The slash command requires a couple of variables:

```
Command: /okr
Request URL: https://<region>-<firebase-instance>.cloudfunctions.net/okrSlackBot
Short Description: Subscribe to Org/Dep/Product
Usage Hint: subscribe [org/dep/prod] slug
```

Firebase needs a couple of new configs as well. These are `slack.token` and `host_url`. The `host_url` is the URL of you okr-tracker site, for us, it is `https://okr.oslo.systems`, and the token is an OAuth token from you Slack App settings page, under the sub-page `OAuth & Permissions`, it is a Bot User OAuth Token.

```
firebase functions:config:set slack.token="YOUR SLACK OAUTH TOKEN HERE"
firebase functions:config:set slack.host_url="HOST URL"
```

## Supported providers

OKR-tracker supports for the time being only four login providers: Microsoft, Google, email/pass. If you are looking for other providers that firebase support, we would love for you to open up a PR with the needed changes.

### Microsoft integration

For the Microsoft-integration a TENANT must be specified as the environment-variable VITE_MICROSOFT_TENANT_ID.

### Google integration

Anyone with a google-account can login. To limit domain you have to implement this somehwhere, e.g. in `set_user.js` - e.g. `if (!user.email.lowerCase().endsWith('oslo.kommune.no')) rejectAccess();`

## Common problems

If there are some problems running the project locally, or you get an infinite spinner: inspect the console in the browser, your terminal or `firebase-debug.log` file for error messages. Some common messages when firing up the project for the first time:

1. "No such file or directory, scandir storage_export/metadata"
   1. You need to create two directories under `mock_data/storage_export` - `blobs` and `metadata`
2. It looks like you're trying to access functions.config().service_account but there is no value there
   1. Check if you have set the config key for service_account correctly. Read the readme again and se how you need to cat the private-key file correctly
3. Missing permissions required for functions deploy. You must have permission iam.serviceAccounts.ActAs on service account
   1. Open the [Google Cloud Console](https://console.cloud.google.com/) (check that you are in the correct project).
   2. Go to IAM & Admin -> Service Accounts
   3. Find the service account and click on it
   4. Click on the "Permissions" panel, then click `Grant Access`
   5. Add your IAM member email address. For the role, select Service Accounts -> Service Account User
   6. Click Save
4. Cannot read property `bucket` of underfined
   1. Set the config key `storage.bucket`. Please read the readme again
