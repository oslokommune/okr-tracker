/**
 * Generates listeners for various events for the following collections.
 *
 * * docPath - The document path
 * * fields - The fields for which changes should be logged
 * * collectionRef - The document's collection
 * * documentType - For namespacing event names
 */

// TODO: Audit for key result progress

import auditOnDeleteGenerator from './auditOnDeleteGenerator.js';
import auditOnUpdateGenerator from './auditOnUpdateGenerator.js';
import auditOnCreateGenerator from './auditOnCreateGenerator.js';

const organizationsConfig = {
  docPath: 'organizations/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: 'organizations',
  documentType: 'Organization',
};

const departmentsConfig = {
  docPath: 'departments/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: 'departments',
  documentType: 'Department',
};

const productsConfig = {
  docPath: 'products/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: 'products',
  documentType: 'Product',
};

const periodsConfig = {
  docPath: 'periods/{documentId}',
  fields: ['name', 'startDate', 'endDate', 'archived'],
  collectionRef: 'periods',
  documentType: 'Period',
};

const objectivesConfig = {
  docPath: 'objectives/{documentId}',
  fields: ['name', 'archived', 'description', 'icon', 'weight'],
  collectionRef: 'objectives',
  documentType: 'Objective',
};

const keyResultsConfig = {
  docPath: 'keyResults/{documentId}',
  fields: [
    'name',
    'archived',
    'description',
    'longDescription',
    'unit',
    'targetValue',
    'startValue',
    'auto',
    'weight',
    'progression',
  ],
  collectionRef: 'keyResults',
  documentType: 'KeyResult',
};

const kpiConfig = {
  docPath: 'kpis/{documentId}',
  fields: ['api', 'name', 'description', 'type', 'currentValue'],
  collectionRef: 'kpis',
  documentType: 'KPI',
};

export const organizationCreate = auditOnCreateGenerator(organizationsConfig);
export const organizationUpdate = auditOnUpdateGenerator(organizationsConfig);
export const organizationDelete = auditOnDeleteGenerator(organizationsConfig);

export const departmentCreate = auditOnCreateGenerator(departmentsConfig);
export const departmentUpdate = auditOnUpdateGenerator(departmentsConfig);
export const departmentDelete = auditOnDeleteGenerator(departmentsConfig);

export const productCreate = auditOnCreateGenerator(productsConfig);
export const productUpdate = auditOnUpdateGenerator(productsConfig);
export const productDelete = auditOnDeleteGenerator(productsConfig);

export const periodCreate = auditOnCreateGenerator(periodsConfig);
export const periodUpdate = auditOnUpdateGenerator(periodsConfig);
export const periodDelete = auditOnDeleteGenerator(periodsConfig);

export const objectiveCreate = auditOnCreateGenerator(objectivesConfig);
export const objectiveUpdate = auditOnUpdateGenerator(objectivesConfig);
export const objectiveDelete = auditOnDeleteGenerator(objectivesConfig);

export const keyResultCreate = auditOnCreateGenerator(keyResultsConfig);
export const keyResultUpdate = auditOnUpdateGenerator(keyResultsConfig);
export const keyResultDelete = auditOnDeleteGenerator(keyResultsConfig);

export const KPICreate = auditOnCreateGenerator(kpiConfig);
export const KPIUpdate = auditOnUpdateGenerator(kpiConfig);
export const KPIDelete = auditOnDeleteGenerator(kpiConfig);
