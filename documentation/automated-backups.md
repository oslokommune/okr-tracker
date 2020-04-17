# Automated Backup with Cloud Functions

We use cloud functions to backup our database every night and only keep backup of the last 14 days. If a backup is older than 14 days it gets automatically and permanently deleted from the storage bucket.

#### Requirements for automated backups

- Firebase Blaze plan
- Set IAM Permission
- Manually create a storage bucket
- Cloud function

You can follow [this tutorial](https://thecloudfunction.com/blog/firebase-cloud-functions-automated-backups/) on how to create automated backups.

TLDR:
- Navigate to `Google Cloud Console` and choose your project
- Navigate to IAM & Admin - Your App Engine Service account needs the `Cloud Datastore Import Export Admin` role
- Navigate to `Storage` - Create a storage bucket - Give it a rule to delete storage that is >14 days old
- Run the command `firebase functions:config:set storage.bucket="<your-storage-bucket-name>"`

### Automated Restore with Cloud Functions

This is called automated restore but we still need to manually trigger a cloud function that does the restore from the Google Cloud Console

Follow this [tutorial](https://thecloudfunction.com/blog/firebase-cloud-functions-recovery-backups/)

TLDR:
- From your Google Cloud Console navigate to `PubSub`
- Create a topic and name it `restore-backup`
- Trigger the topic by publishing a message and the restore will be triggered

Gif of the process:
![Gif of the process src: thecloudfunction-blog](recovery.gif)
