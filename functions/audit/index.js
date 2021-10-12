/**
 * Generates listeners for various events for the following collections.
 *
 * * docPath - The document path
 * * fields - The fields for which changes should be logged
 * * collectionRef - The document's collection
 * * documentType - For namespacing event names
 */

// TODO: Audit for key result progress

const admin = require('firebase-admin');
const { auditOnUpdateGenerator } = require('./auditOnUpdateGenerator');
const { auditOnCreateGenerator } = require('./auditOnCreateGenerator');
const { auditOnDeleteGenerator } = require('./auditOnDeleteGenerator');

const db = admin.firestore();

const organizationsConfig = {
  docPath: 'organizations/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('organizations'),
  documentType: 'Organization',
};
const departmentsConfig = {
  docPath: 'departments/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('departments'),
  documentType: 'Department',
};
const productsConfig = {
  docPath: 'products/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('products'),
  documentType: 'Product',
};
const periodsConfig = {
  docPath: 'periods/{documentId}',
  fields: ['name', 'startDate', 'endDate', 'archived'],
  collectionRef: db.collection('periods'),
  documentType: 'Period',
};
const objectivesConfig = {
  docPath: 'objectives/{documentId}',
  fields: ['name', 'archived', 'description', 'icon', 'weight'],
  collectionRef: db.collection('objectives'),
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
  collectionRef: db.collection('keyResults'),
  documentType: 'KeyResult',
};

const kpiConfig = {
  docPath: 'kpis/{documentId}',
  fields: [
    'api',
    'name',
    'description',
    'type',
    'currentValue',
  ],
  collectionRef: db.collection('kpis'),
  documentType: 'KPI',
}

exports.OrganizationCreate = auditOnCreateGenerator(organizationsConfig);
exports.OrganizationUpdate = auditOnUpdateGenerator(organizationsConfig);
exports.OrganizationDelete = auditOnDeleteGenerator(organizationsConfig);

exports.DepartmentCreate = auditOnCreateGenerator(departmentsConfig);
exports.DepartmentUpdate = auditOnUpdateGenerator(departmentsConfig);
exports.DepartmentDelete = auditOnDeleteGenerator(departmentsConfig);

exports.ProductCreate = auditOnCreateGenerator(productsConfig);
exports.ProductUpdate = auditOnUpdateGenerator(productsConfig);
exports.ProductDelete = auditOnDeleteGenerator(productsConfig);

exports.PeriodCreate = auditOnCreateGenerator(periodsConfig);
exports.PeriodUpdate = auditOnUpdateGenerator(periodsConfig);
exports.PeriodDelete = auditOnDeleteGenerator(periodsConfig);

exports.ObjectiveCreate = auditOnCreateGenerator(objectivesConfig);
exports.ObjectiveUpdate = auditOnUpdateGenerator(objectivesConfig);
exports.ObjectiveDelete = auditOnDeleteGenerator(objectivesConfig);

exports.KeyResultCreate = auditOnCreateGenerator(keyResultsConfig);
exports.KeyResultUpdate = auditOnUpdateGenerator(keyResultsConfig);
exports.KeyResultDelete = auditOnDeleteGenerator(keyResultsConfig);

exports.KPICreate = auditOnCreateGenerator(kpiConfig);
exports.KPIUpdate = auditOnUpdateGenerator(kpiConfig);
exports.KPIDelete = auditOnDeleteGenerator(kpiConfig);
