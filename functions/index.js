const admin = require('firebase-admin');
const functions = require('firebase-functions');

const config = require('./config');

// Initialize the app to get everything started
admin.initializeApp();

const db = admin.firestore();

/*
|----------------------------------------------------------------------------------
|
| Import functions
|
|----------------------------------------------------------------------------------
*/

const { handleProgressionUpdates } = require('./updateProgression');
const { automatedBackups, automatedRestore } = require('./backupAndRestore');
const { scheduledFunction, triggerScheduledFunction } = require('./automatedKeyResults');
/*
|----------------------------------------------------------------------------------
|
| Export functions
|
|----------------------------------------------------------------------------------
*/

/**
 * Update progression for the objective and its period when a key result gets
 * added, changed, removed or changes to its child progressions
 */
exports.updatedKeyResultProgression = handleProgressionUpdates('product', 'progression');
exports.updatedDepartmentKeyResultProgression = handleProgressionUpdates('department', 'progression');
exports.updatedOrganizationKeyResultProgression = handleProgressionUpdates('organization', 'progression');
exports.updatedKeyResult = handleProgressionUpdates('product', 'keyResult');
exports.updatedDepartmentKeyResult = handleProgressionUpdates('department', 'keyResult');
exports.updatedOrganizationKeyResult = handleProgressionUpdates('organization', 'keyResult');

/**
 * Functions for backup and restoring the Firestore database
 */
exports.automatedBackups = automatedBackups();
exports.automatedRestore = automatedRestore();

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.scheduledFunction = scheduledFunction();
exports.triggerScheduledFunction = triggerScheduledFunction();

/**
 * Function for populating mock data to Firebase emulator when developing
 * locally. Will not be used in production.
 */
exports.populateFirestoreEmulator = require('./populateFirestoreEmulator');

/**
 * Transforms the old data model to a new flatter one
 */
exports.transformDataModel = require('./transformDataModel');

function getDiff(change, keys) {
  const diff = {};
  const before = change.before.data();
  const after = change.after.data();

  keys.forEach(key => {
    if (before[key] !== after[key]) {
      diff[key] = {
        before: before[key],
        after: after[key],
      };
    }
  });

  return diff;
}

exports.updateProgression = functions
  .region(config.region)
  .firestore.document('keyResults/{keyResultId}/progress/{progressId}')
  .onWrite(async (change, context) => {
    const { keyResultId } = context.params;
    const { value, createdBy: user } = change.after.data();

    db.collection('audit').add({
      event: 'addKeyResProgress',
      created: new Date(),
      user,
      value,
      keyResult: db.collection('keyResults').doc(keyResultId),
    });
  });

exports.updateDepartment = functions
  .region(config.region)
  .firestore.document('departments/{departmentId}')
  .onWrite(async (change, context) => {
    const diff = getDiff(change, ['name', 'archived', 'missionStatement', 'slug']);

    const { departmentId } = context.params;
    const { updatedBy: user } = change.after.data();

    db.collection('audit').add({
      event: 'updateDepartment',
      created: new Date(),
      department: db.collection('departments').doc(departmentId),
      user,
      ...diff,
    });
  });
