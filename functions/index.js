const admin = require('firebase-admin');

// Initialize the app to get everything started
admin.initializeApp();

/**
 * Functions for backup and restoring the Firestore database
 */
exports.automatedBackups = require('./backupAndRestore').automatedBackups();
exports.automatedRestore = require('./backupAndRestore').automatedRestore();

/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
exports.scheduledFunction = require('./automatedKeyResults').scheduledFunction;
exports.triggerScheduledFunction = require('./automatedKeyResults').triggerScheduledFunction;

/**
 * Function for populating mock data to Firebase emulator when developing
 * locally. Will not be used in production.
 */
exports.populateFirestoreEmulator = require('./populateFirestoreEmulator');

/**
 * Transforms the old data model to a new flatter one
 */
exports.transformDataModel = require('./transformDataModel');

/**
 * Listens for create, update and delete operations and logs the event with meta data
 */
exports.AuditOrganizationUpdate = require('./audit').OrganizationUpdate;
exports.AuditOrganizationCreate = require('./audit').OrganizationCreate;
exports.AuditOrganizationDelete = require('./audit').OrganizationDelete;
exports.AuditDepartmentUpdate = require('./audit').DepartmentUpdate;
exports.AuditDepartmentCreate = require('./audit').DepartmentCreate;
exports.AuditDepartmentDelete = require('./audit').DepartmentDelete;
exports.AuditProductUpdate = require('./audit').ProductUpdate;
exports.AuditProductCreate = require('./audit').ProductCreate;
exports.AuditProductDelete = require('./audit').ProductDelete;
exports.AuditPeriodUpdate = require('./audit').PeriodUpdate;
exports.AuditPeriodCreate = require('./audit').PeriodCreate;
exports.AuditPeriodDelete = require('./audit').PeriodDelete;
exports.AuditObjectiveUpdate = require('./audit').ObjectiveUpdate;
exports.AuditObjectiveCreate = require('./audit').ObjectiveCreate;
exports.AuditObjectiveDelete = require('./audit').ObjectiveDelete;
exports.AuditKeyResultUpdate = require('./audit').KeyResultUpdate;
exports.AuditKeyResultCreate = require('./audit').KeyResultCreate;
exports.AuditKeyResultDelete = require('./audit').KeyResultDelete;
