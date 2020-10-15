# Import production data from cloud firestore to the local firestore

based on [this tutorial](https://medium.com/firebase-developers/how-to-import-production-data-from-cloud-firestore-to-the-local-emulator-e82ae1c6ed8) with a few differences for our use case

The newest version of the OKR-Tracker uses the Firebase Local Emulator Suite, where you can play and test your data without beging afraid of production changes. It is still in the early stages, which means that auth is still handled by the cloud firebase and not locally.

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

```
firebase login
gcloud auth login
```

See the list of your projects and connect to the one you'd like to export data from:

```
firebase projects:list
firebase use <your project id>

gcloud projects list
gcloud config set project <your project id>
```

For the sake of this how to, we'll be using `okr-tracker-production` (production) for gcloud, and `origo-okr-tracker` (development) for the Firebase. The reason is that we use auth from our development firebase instance, and not from the production instance.

If you don't already have automated backups of your production data, we will need to export the production data to a backup on GCP:

```
gcloud firestore export gs://okr-tracker-production.appspot.com/<backup-folder-name>
```

Now copy the new folder to your local machine, we are going to do this from our functions-folder:

```
cd functions
gsutil -m cp -r gs://okr-tracker-production.appspot.com/<backup-folder-name> .
```

If you already have automated backups of your production data, you don't need to export the production data, only import it. For this application our backup folder is not part of the Firebase storage bucket:

```
gsutil -m cp -r gs://okr-tracker-backup/<YYYY-MM-DD>
```

### Import production data

To import the production data into your local Firebase emulator, you will need a metadata-file on the root folder, named `firebase-export-metadata.json`:

```
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

```
firebase emulators:start --import=./
```


### Migrate from old databse

If your database uses the old datamodel, you need to run the migration script after import

```
node src/migrate
```
