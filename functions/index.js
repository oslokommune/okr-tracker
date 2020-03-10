const d3 = require('d3');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

admin.initializeApp();
const db = admin.firestore();

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const sheetsEmail = functions.config().sheets.email;
const sheetsKey = functions.config().sheets.key;
const jwtClient = new google.auth.JWT(sheetsEmail, null, sheetsKey, scopes);
const storageBucketName = functions.config().storage.bucket;

jwtClient.authorize(function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Successfully connected!');
  }
});

/* eslint-disable  */
const orgsPath = 'orgs/{orgId}';
const departmentsPath = orgsPath + '/departments/{departmentId}';
const productsPath = departmentsPath + '/products/{productId}';
const objectivesPath = productsPath + '/objectives/{objectiveId}';
const keyResultsPath = objectivesPath + '/keyResults/{keyresId}';
const progressionsPath = keyResultsPath + '/progress/{progressionId}';
const departmentObjectivesPath = departmentsPath + '/objectives/{objectiveId}';
const departmentKeyResultsPath = departmentObjectivesPath + '/keyResults/{keyResId}';
const departmentProgressionsPath = departmentKeyResultsPath + '/progress/{progressionId}';
const organizationObjectivesPath = orgsPath + '/objectives/{objectiveId}';
const organizationKeyResultsPath = organizationObjectivesPath + '/keyResults/{keyResId}';
const organizationProgressionsPath = organizationKeyResultsPath + '/progress/{progressionId}';
/* eslint-enable */

exports.updatedKeyResultProgression = functions
  .region('europe-west2')
  .firestore.document(progressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, productId, objectiveId } = context.params;
    const productPath = `orgs/${orgId}/departments/${departmentId}/products/${productId}`;
    const objectivePath = `${productPath}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    await db.doc(objectivePath).update({ progression, edited, editedBy });

    const period = await db
      .doc(objectivePath)
      .get()
      .then(snapshot => snapshot.data().period);

    // Get the average progression for all objectives
    // in the same period
    const periodProgression = await db
      .doc(productPath)
      .collection('objectives')
      .where('archived', '==', false)
      .where('period', '==', period)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data().progression))
      .then(values => d3.mean(values));

    await period.update({ progression: periodProgression });

    return true;
  });

exports.updatedDepartmentKeyResultProgression = functions
  .region('europe-west2')
  .firestore.document(departmentProgressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, objectiveId } = context.params;
    const departmentPath = `orgs/${orgId}/departments/${departmentId}`;
    const objectivePath = `${departmentPath}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    await db.doc(objectivePath).update({ progression, edited, editedBy });

    const period = await db
      .doc(objectivePath)
      .get()
      .then(snapshot => snapshot.data().period);

    // Get the average progression for all objectives
    // in the same period
    const periodProgression = await db
      .doc(departmentPath)
      .collection('objectives')
      .where('archived', '==', false)
      .where('period', '==', period)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data().progression))
      .then(values => d3.mean(values));

    await period.update({ progression: periodProgression });

    return true;
  });

exports.updatedOrganizationKeyResultProgression = functions
  .region('europe-west2')
  .firestore.document(organizationProgressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, objectiveId } = context.params;
    const organizationPath = `orgs/${orgId}`;
    const objectivePath = `${organizationPath}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    await db.doc(objectivePath).update({ progression, edited, editedBy });

    const period = await db
      .doc(objectivePath)
      .get()
      .then(snapshot => snapshot.data().period);

    // Get the average progression for all objectives
    // in the same period
    const periodProgression = await db
      .doc(organizationPath)
      .collection('objectives')
      .where('archived', '==', false)
      .where('period', '==', period)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data().progression))
      .then(values => d3.mean(values));

    await period.update({ progression: periodProgression });

    return true;
  });

// Triggers when a department key result is created, deleted, edited, archived
// Re-calculates the progression for the objective
exports.updatedKeyResult = functions
  .region('europe-west2')
  .firestore.document(keyResultsPath)
  .onWrite(async (change, context) => {
    const { orgId, productId, departmentId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/products/${productId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, editedBy });
  });

// Triggers when a department key result is created, deleted, edited, archived
// Re-calculates the progression for the objective
exports.updatedDepartmentKeyResult = functions
  .region('europe-west2')
  .firestore.document(departmentKeyResultsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions) || 0;
    const edited = new Date();
    const editedBy = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, editedBy });
  });

// Triggers when a department key result is created, deleted, edited, archived
// Re-calculates the progression for the objective
exports.updatedOrganizationKeyResult = functions
  .region('europe-west2')
  .firestore.document(organizationKeyResultsPath)
  .onWrite(async (change, context) => {
    const { orgId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions) || 0;
    const edited = new Date();
    const editedBy = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, editedBy });
  });

/**
 * Finds all progressions for key results related to the Objective
 * @param {String} path - path to objective
 * @returns {Promise} - Resolves to a list of decimal numbers
 */
async function getKeyResultsProgressions(path) {
  const progression = await db
    .doc(path)
    .collection('keyResults')
    .where('archived', '==', false)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()))
    .then(list => list.map(getProgressionPercentage));

  return progression.length ? progression : [0];
}

/**
 * Finds the progress in percent for a key result object
 * @param {Object} keyres - key result document
 * @return {Number} - Between 0 and 1
 */
function getProgressionPercentage(keyres) {
  /* eslint-disable-next-line */
  const { targetValue, startValue } = keyres;
  const currentValue = keyres.currentValue || 0;

  const scale = d3
    .scaleLinear()
    .domain([startValue, targetValue]) /* eslint-disable-line */
    .clamp(true);
  return scale(currentValue) || 0;
}

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.scheduledFunction = functions
  .region('europe-west2')
  .pubsub.schedule('every 12 hours')
  .onRun(async () => {
    return db
      .collectionGroup('keyResults')
      .where('auto', '==', true)
      .get()
      .then(snapshot => snapshot.docs.map(d => ({ ref: d.ref, ...d.data() })))
      .then(list => list.map(getAndSaveDataFromSheets))
      .catch(e => {
        throw new Error(e);
      });
  });

exports.triggerScheduledFunction = functions.region('europe-west2').https.onCall(async docPath => {
  const doc = await db
    .doc(docPath)
    .get()
    .then(d => ({ ref: d.ref, ...d.data() }));

  return JSON.stringify(getAndSaveDataFromSheets(doc));
});

/**
 * Finds and saves the value in the Google Sheets document
 * for the provided Key Result reference
 * @param {DocumentReference} document - The Key Result
 * @returns {Object} - Result is true or false
 */
async function getAndSaveDataFromSheets(document) {
  const { ref, sheetId, sheetName, sheetCell } = document;
  const now = new Date();
  const value = await getSheetsData(sheetId, sheetName, sheetCell);

  if (!value) return { result: false };

  await ref.collection('progress').add({ value, archived: false, created: now, timestamp: now, createdBy: 'auto' });
  await document.ref.update({ currentValue: value });

  return { result: true };
}

/**
 * Gets a value from a Google Sheet cell
 * @param {String} sheetId - ID of Sheets Document
 * @param {String} sheetName - Name of Sheet (tab)
 * @param {String} cell - Cell name of value
 * @returns {Number} - Value of the cell
 */
async function getSheetsData(sheetId, sheetName, cell) {
  const sheets = google.sheets('v4');
  if (!sheetId || !sheetName || !cell) return;

  const sheetRequest = {
    auth: jwtClient,
    spreadsheetId: sheetId,
    range: `${sheetName}!${cell}`,
  };

  return sheets.spreadsheets.values
    .get(sheetRequest)
    .then(response => {
      return +response.data.values[0][0];
    })
    .catch(err => {
      throw new Error(err);
    });
}

exports.automatedBackups = functions
  .region('europe-west2')
  .pubsub.schedule('0 0 * * *')
  .onRun(generateBackup);

async function generateBackup() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const path = `${new Date().toISOString().split('T')[0]}`;

  const projectId = await auth.getProjectId();
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
    .catch(async error => {
      console.error('Error message: ', error.message);
      return Promise.reject(new Error({ message: error.message }));
    });
}

exports.automatedRestore = functions
  .region('europe-west2')
  .pubsub.topic('restore-backup')
  .onPublish(restoreBackup);

async function restoreBackup() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const oneDayBefore = new Date();
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const path = `${oneDayBefore.toISOString().split('T')[0]}`;

  const projectId = await auth.getProjectId();
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
    .catch(async error => {
      console.error('Error message: ', error.message);
      return Promise.reject(new Error({ message: error.message }));
    });
}
