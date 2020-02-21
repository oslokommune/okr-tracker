const d3 = require('d3');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const sheetsEmail = functions.config().sheets.email;
const sheetsKey = functions.config().sheets.key;
const jwtClient = new google.auth.JWT(sheetsEmail, null, sheetsKey, scopes);

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
/* eslint-enable */

exports.updatedKeyResultProgression = functions.firestore
  .document(progressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, productId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/products/${productId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, editedBy });
  });

exports.updatedDepartmentKeyResultProgression = functions.firestore
  .document(departmentProgressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const editedBy = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, editedBy });
  });

// Triggers when a department key result is created, deleted, edited, archived
// Re-calculates the progression for the objective
exports.updatedKeyResult = functions.firestore.document(keyResultsPath).onWrite(async (change, context) => {
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
exports.updatedDepartmentKeyResult = functions.firestore
  .document(departmentKeyResultsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/objectives/${objectiveId}`;

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

// Triggers when a product's objective is changed (i.e. progression)
exports.updatedObjectiveProgression = functions.firestore.document(objectivesPath).onWrite(async (change, context) => {
  const { orgId, departmentId, productId } = context.params;
  const productPath = `orgs/${orgId}/departments/${departmentId}/products/${productId}`;
  const progressions = await getObjectiveProgressions(productPath);
  const edited = new Date();
  const editedBy = 'cloud-function';

  await db.doc(productPath).update({ progressions, edited, editedBy });
  return true;
});

// Triggers when a department's objective is changed (i.e. progression)
exports.updatedDepartmentObjectiveProgression = functions.firestore
  .document(departmentObjectivesPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId } = context.params;
    const departmentPath = `orgs/${orgId}/departments/${departmentId}`;
    const progressions = await getObjectiveProgressions(departmentPath);
    const edited = new Date();
    const editedBy = 'cloud-function';

    await db.doc(departmentPath).update({ progressions, edited, editedBy });

    return true;
  });

/**
 * Finds the progressions for each quarter for a department
 * or a product. Returns an object with the quarter names as keys.
 * @param {String} path - Path to product or deparment
 * @returns {Object} - Dictionary of progressions for each quarter
 */
async function getObjectiveProgressions(path) {
  const objectiveProgressions = await db
    .doc(path)
    .collection('objectives')
    .where('archived', '==', false)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()));

  // Nest objectives by quarter
  const progressionsList = d3
    .nest()
    .key(d => d.quarter)
    .rollup(list => d3.mean(list.map(obj => obj.progression || 0)))
    .entries(objectiveProgressions)
    .map(d => {
      const { key, value } = d;
      const obj = {};
      obj[key] = value || 0;
      return obj;
    });

  // Convert array to object with quarter name as key
  const progressions = {};
  progressionsList.forEach(d => {
    const key = Object.keys(d)[0];
    if (!key || !d[key]) return;
    progressions[key] = d[key];
  });

  return progressions;
}

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.scheduledFunction = functions.pubsub.schedule('every 12 hours').onRun(async () => {
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

exports.triggerScheduledFunction = functions.https.onCall(async docPath => {
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
