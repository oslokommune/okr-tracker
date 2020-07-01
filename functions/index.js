const admin = require('firebase-admin');

// Initialize the app to get everything started
admin.initializeApp();

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
const populateFirestoreEmulator = require('./populateFirestoreEmulator');
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

exports.populateFirestoreEmulator = populateFirestoreEmulator;
