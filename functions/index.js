/* eslint-disable import/extensions */
/* eslint-disable import/no-mutable-exports */
import { initializeApp, cert } from 'firebase-admin/app';
import functions from 'firebase-functions';
import handleKpiProgress from './kpi/progress/index.js';
import handleKpiGoals from './kpi/goals/index.js';

import api from './api/index.js';
import internal from './backend/index.js';

// Initialize the app to get everything started
initializeApp({
  credential: cert(functions.config().service_account),
});

// /**
//  * Functions for backup and restoring the Firestore database
//  */
export { automatedBackups } from './backupAndRestore.js';
export { automatedRestore } from './backupAndRestore.js';
/**
 * Scheduled function that automatically updates the progress for all key results
 * with the `auto` property set to true, getting the data from the provided
 * google sheets details.
 */
export { fetchAutomatedKeyResOnSchedule } from './automatedKeyResults.js';
export { triggerScheduledFunction } from './automatedKeyResults.js';

export { fetchKpiDataOnCreate } from './kpi/index.js';
export { fetchKpiDataOnSchedule } from './kpi/index.js';
export { fetchKpiDataTrigger } from './kpi/index.js';
export { handleKpiProgress };
export { handleKpiGoals };

export { slugDepartment } from './slug/index.js';
export { slugOrganization } from './slug/index.js';
export { slugProduct } from './slug/index.js';

/**
 * Listens for create, update and delete operations and logs the event with meta data
 */
export { organizationUpdate as auditOrganizationUpdate } from './audit/index.js';
export { organizationCreate as auditOrganizationCreate } from './audit/index.js';
export { organizationDelete as auditOrganizationDelete } from './audit/index.js';

export { departmentUpdate as auditDepartmentUpdate } from './audit/index.js';
export { departmentCreate as auditDepartmentCreate } from './audit/index.js';
export { departmentDelete as auditDepartmentDelete } from './audit/index.js';

export { productUpdate as auditProductUpdate } from './audit/index.js';
export { productCreate as auditProductCreate } from './audit/index.js';
export { productDelete as auditProductDelete } from './audit/index.js';

export { periodUpdate as auditPeriodUpdate } from './audit/index.js';
export { periodCreate as auditPeriodCreate } from './audit/index.js';
export { periodDelete as auditPeriodDelete } from './audit/index.js';

export { objectiveUpdate as auditObjectiveUpdate } from './audit/index.js';
export { objectiveCreate as auditObjectiveCreate } from './audit/index.js';
export { objectiveDelete as auditObjectiveDelete } from './audit/index.js';

export { keyResultUpdate as auditKeyResultUpdate } from './audit/index.js';
export { keyResultCreate as auditKeyResultCreate } from './audit/index.js';
export { keyResultDelete as auditKeyResultDelete } from './audit/index.js';

export { KPIUpdate as auditKPIUpdate } from './audit/index.js';
export { KPICreate as auditKPICreate } from './audit/index.js';
export { KPIDelete as auditKPIDelete } from './audit/index.js';

/**
 * Listen for changes in progress and update key results and items accordingly
 */
export { handleKeyResultProgress } from './progress/index.js';
export { handleKeyResultProgressOnKeyResultUpdate } from './progress/index.js';

// // Express servers run via Cloud Functions
export { api, internal };
