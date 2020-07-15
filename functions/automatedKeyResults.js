const admin = require('firebase-admin');

const functions = require('firebase-functions');
const { google } = require('googleapis');

const config = require('./config');

const db = admin.firestore();

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const sheetsEmail = functions.config().sheets.email;
const sheetsKey = functions.config().sheets.key;
const jwtClient = new google.auth.JWT(sheetsEmail, null, sheetsKey, scopes);

jwtClient.authorize(function (err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Successfully connected!');
  }
});

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.scheduledFunction = function () {
  return functions
    .region(config.region)
    .pubsub.schedule(config.autoKeyresFetchFrequency)
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
};

/**
 * Manually trigger the scheduled function
 */
exports.triggerScheduledFunction = function () {
  return functions.region(config.region).https.onCall(async docPath => {
    try {
      return db
        .doc(docPath)
        .get()
        .then(d => ({ ref: d.ref, ...d.data() }))
        .then(doc => JSON.stringify(getAndSaveDataFromSheets(doc)));
    } catch (error) {
      return error;
    }
  });
};

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
