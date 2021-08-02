const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize the app to get everything started
admin.initializeApp({
  credential: admin.credential.cert(functions.config().service_account),
});

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
exports.fetchAutomatedKeyResOnSchedule = require('./automatedKeyResults').fetchAutomatedKeyResOnSchedule;
exports.triggerScheduledFunction = require('./automatedKeyResults').triggerScheduledFunction;

/**
 * KPI functions
 */
exports.FetchKpiDataOnCreate = require('./kpi').FetchKpiDataOnCreate;
exports.FetchKpiDataOnUpdate = require('./kpi').FetchKpiDataOnUpdate;
exports.FetchKpiDataOnSchedule = require('./kpi').FetchKpiDataOnSchedule;

exports.SlugDepartment = require('./slug').SlugDepartment;
exports.SlugOrganization = require('./slug').SlugOrganization;
exports.SlugProducts = require('./slug').SlugProducts;

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

/**
 * Listen for changes in progress and update key results and items accordingly
 */
exports.handleKeyResultProgress = require('./progress').handleKeyResultProgress;
exports.handleKeyResultProgressOnKeyResultUpdate = require('./progress').handleKeyResultProgressOnKeyResultUpdate;
exports.handleKeyResultProgressOnObjectiveUpdate = require('./progress').handleKeyResultProgressOnObjectiveUpdate;

exports.createCustomToken = require('./tokenCreator').createCustomToken;

// Express servers run via Cloud Functions
exports.api = require('./api').app;
exports.internal = require('./backend').app;

// Verify emails that are created with Microsoft accounts
exports.verifyMicrosoftAccount = require('./verifyMicrosoftAccounts').verifyMicrosoftAccount;
