import auth from 'google-auth-library';
import functions from 'firebase-functions';
import config from './config.js';

const { GoogleAuth } = auth;

export const automatedBackups = functions
  .region(config.region)
  .pubsub.schedule(config.backupFrequency)
  .timeZone(config.timeZone)
  .onRun(generateBackup);

export const automatedRestore = functions
  .region(config.region)
  .pubsub.topic('restore-backup')
  .onPublish(restoreBackup);

function getBucketName() {
  const bucket = process.env.BACKUP_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error('BACKUP_STORAGE_BUCKET is not set in `functions/.env`');
  }
  return bucket;
}

async function restoreBackup() {
  const gAuth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });

  const client = await gAuth.getClient();
  const oneDayBefore = new Date();
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const path = `${oneDayBefore.toISOString().split('T')[0]}`;

  const projectId = await gAuth.getProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):importDocuments`;
  const backupRoute = `gs://${getBucketName()}/${path}`;

  return client
    .request({
      url,
      method: 'POST',
      data: {
        inputUriPrefix: backupRoute,
      },
    })
    .then(() => {
      console.log(`Backup restored from folder ${backupRoute}`);
      return Promise.resolve();
    });
}

async function generateBackup() {
  const gAuth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });

  const client = await gAuth.getClient();
  const path = `${new Date().toISOString().split('T')[0]}`;

  const projectId = await gAuth.getProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
  const backupRoute = `gs://${getBucketName()}/${path}`;

  return client
    .request({
      url,
      method: 'POST',
      data: {
        outputUriPrefix: backupRoute,
      },
    })
    .then(() => {
      console.log(`Backup saved to folder on ${backupRoute}`);
      return Promise.resolve();
    });
}
