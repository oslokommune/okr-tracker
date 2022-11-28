import auth from 'google-auth-library';
import functions from 'firebase-functions';
import config from './config.js';

const { GoogleAuth } = auth;
const storageBucketName =
  process.env.BACKUP_STORAGE_BUCKET || functions.config().storage.bucket;

export const automatedBackups = functions
  .region(config.region)
  .pubsub.schedule(config.backupFrequency)
  .timeZone(config.timeZone)
  .onRun(generateBackup);

export const automatedRestore = functions
  .region(config.region)
  .pubsub.topic('restore-backup')
  .onPublish(restoreBackup);

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
  const backupRoute = `gs://${storageBucketName}/${path}`;

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
    })
    .catch(async (error) => {
      console.error('Error message: ', error.message);
      return Promise.reject(new Error({ message: error.message }));
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
  const backupRoute = `gs://${storageBucketName}/${path}`;

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
    })
    .catch(async (error) => {
      console.error('Error message: ', error.message);
      return Promise.reject(new Error({ message: error.message }));
    });
}
