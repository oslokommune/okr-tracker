import admin from 'firebase-admin';
import functions from 'firebase-functions';

import okrTrackerSlackBot from './slackbot';
import { slackNotificationOnUserRequest, slackNotificationInteractiveOnRequest } from './requestAccess';

const isSlackActive = functions.config().slack.active || false;

// Initialize the app to get everything started
admin.initializeApp({
  credential: admin.credential.cert(functions.config().service_account),
});

/**
 * Functions for backup and restoring the Firestore database
 */
export { automatedBackups } from './backupAndRestore';
export { automatedRestore } from './backupAndRestore';
/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
export { fetchAutomatedKeyResOnSchedule } from './automatedKeyResults';
export { triggerScheduledFunction } from './automatedKeyResults';

/**
 * KPI functions
 */
export { fetchKpiDataOnUpdate } from './kpi';
export { fetchKpiDataOnCreate } from './kpi';
export { fetchKpiDataOnSchedule } from './kpi';

export { slugDepartment } from './slug';
export { slugOrganization } from './slug';
export { slugProduct } from './slug';

/**
 * Listens for create, update and delete operations and logs the event with meta data
 */
export { organizationUpdate as auditOrganizationUpdate } from './audit';
export { organizationCreate as auditOrganizationCreate } from './audit';
export { organizationDelete as auditOrganizationDelete } from './audit';

export { departmentUpdate as auditDepartmentUpdate } from './audit';
export { departmentCreate as auditDepartmentCreate } from './audit';
export { departmentDelete as auditDepartmentDelete } from './audit';

export { productUpdate as auditProductUpdate } from './audit';
export { productCreate as auditProductCreate } from './audit';
export { productDelete as auditProductDelete } from './audit';

export { periodUpdate as auditPeriodUpdate } from './audit';
export { periodCreate as auditPeriodCreate } from './audit';
export { periodDelete as auditPeriodDelete } from './audit';

export { objectiveUpdate as auditObjectiveUpdate } from './audit';
export { objectiveCreate as auditObjectiveCreate } from './audit';
export { objectiveDelete as auditObjectiveDelete } from './audit';

export { keyResultUpdate as auditKeyResultUpdate } from './audit';
export { keyResultCreate as auditKeyResultCreate } from './audit';
export { keyResultDelete as auditKeyResultDelete } from './audit';

export { KPIUpdate as auditKPIUpdate } from './audit';
export { KPICreate as auditKPICreate } from './audit';
export { KPIDelete as auditKPIDelete } from './audit';

/**
 * Listen for changes in progress and update key results and items accordingly
 */
export { handleKeyResultProgress } from './progress';
export { handleKeyResultProgressOnKeyResultUpdate } from './progress';
export { handleKeyResultProgressOnObjectiveUpdate } from './progress';

// Express servers run via Cloud Functions
export { app as api } from './api';
export { app as internal } from './backend';

// OKR-Tracker slackbot
if (isSlackActive) {
  exports.okrTrackerSlackBot = okrTrackerSlackBot;
  exports.slackNotificationOnUserRequest = slackNotificationOnUserRequest;
  exports.slackNotificationInteractiveOnRequest = slackNotificationInteractiveOnRequest;
}
