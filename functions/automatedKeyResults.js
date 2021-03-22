const admin = require('firebase-admin');
const functions = require('firebase-functions');

const getSheetsData = require('./util/getSheetsData');
const config = require('./config');

const db = admin.firestore();

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.fetchAutomatedKeyResOnSchedule = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .pubsub.schedule(config.autoKeyresFetchFrequency)
  .timeZone(config.timeZone)
  .onRun(() => {
    return db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('auto', '==', true)
      .get()
      .then((snapshot) => snapshot.docs.map(({ id }) => updateAutomaticKeyResult(id)))
      .catch((e) => {
        throw new Error(e);
      });
  });

/**
 * Manually trigger the scheduled function
 */
exports.triggerScheduledFunction = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onCall(updateAutomaticKeyResult);

/**
 * Finds the value from the saved sheets data and creates a progress entry for the provided key result id
 * @param {string} id
 * @returns {number}
 */
async function updateAutomaticKeyResult(id) {
  const docRef = db.doc(`keyResults/${id}`);
  const progressRef = docRef.collection(`progress`);

  try {
    const { sheetId, sheetName, sheetCell } = await docRef.get().then((d) => d.data());
    if (!sheetId || !sheetName || !sheetCell) throw new Error('Missing Sheets details');

    const value = await getSheetsData({ sheetId, sheetName, sheetCell });

    if (value === null || value === undefined) throw new Error('Data not found');
    if (isNaN(value)) throw new Error('Invalid data format'); // eslint-disable-line no-restricted-globals

    await progressRef.add({ created: new Date(), archived: false, createdBy: 'auto', value, timestamp: new Date() });
    await docRef.update({ valid: true, error: false });

    return value;
  } catch ({ message }) {
    await docRef.update({ valid: false, error: message });
    throw new functions.https.HttpsError('cancelled', message);
  }
}
