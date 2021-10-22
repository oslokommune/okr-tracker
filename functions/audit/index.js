/**
 * Generates listeners for various events for the following collections.
 *
 * * docPath - The document path
 * * fields - The fields for which changes should be logged
 * * collectionRef - The document's collection
 * * documentType - For namespacing event names
 */

// TODO: Audit for key result progress

import { getFirestore } from 'firebase-admin/firestore';

import auditOnDeleteGenerator from './auditOnDeleteGenerator.js';
import auditOnUpdateGenerator from './auditOnUpdateGenerator.js';
import auditOnCreateGenerator from './auditOnCreateGenerator.js';

const organizationsConfig = (db) => ({
  docPath: 'organizations/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('organizations'),
  documentType: 'Organization',
});

const departmentsConfig = (db) => ({
  docPath: 'departments/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('departments'),
  documentType: 'Department',
});

const productsConfig = (db) => ({
  docPath: 'products/{documentId}',
  fields: ['name', 'archived', 'missionStatement', 'team'],
  collectionRef: db.collection('products'),
  documentType: 'Product',
});

const periodsConfig = (db) => ({
  docPath: 'periods/{documentId}',
  fields: ['name', 'startDate', 'endDate', 'archived'],
  collectionRef: db.collection('periods'),
  documentType: 'Period',
});

const objectivesConfig = (db) => ({
  docPath: 'objectives/{documentId}',
  fields: ['name', 'archived', 'description', 'icon', 'weight'],
  collectionRef: db.collection('objectives'),
  documentType: 'Objective',
});

const keyResultsConfig = (db) => ({
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
});

const kpiConfig = (db) => ({
  docPath: 'kpis/{documentId}',
  fields: ['api', 'name', 'description', 'type', 'currentValue'],
  collectionRef: db.collection('kpis'),
  documentType: 'KPI',
});

export const organizationCreate = () => auditOnCreateGenerator(organizationsConfig(getFirestore()));
export const organizationUpdate = () => auditOnUpdateGenerator(organizationsConfig(getFirestore()));
export const organizationDelete = () => auditOnDeleteGenerator(organizationsConfig(getFirestore()));

export const departmentCreate = () => auditOnCreateGenerator(departmentsConfig(getFirestore()));
export const departmentUpdate = () => auditOnUpdateGenerator(departmentsConfig(getFirestore()));
export const departmentDelete = () => auditOnDeleteGenerator(departmentsConfig(getFirestore()));

export const productCreate = () => auditOnCreateGenerator(productsConfig(getFirestore()));
export const productUpdate = () => auditOnUpdateGenerator(productsConfig(getFirestore()));
export const productDelete = () => auditOnDeleteGenerator(productsConfig(getFirestore()));

export const periodCreate = () => auditOnCreateGenerator(periodsConfig(getFirestore()));
export const periodUpdate = () => auditOnUpdateGenerator(periodsConfig(getFirestore()));
export const periodDelete = () => auditOnDeleteGenerator(periodsConfig(getFirestore()));

export const objectiveCreate = () => auditOnCreateGenerator(objectivesConfig(getFirestore()));
export const objectiveUpdate = () => auditOnUpdateGenerator(objectivesConfig(getFirestore()));
export const objectiveDelete = () => auditOnDeleteGenerator(objectivesConfig(getFirestore()));

export const keyResultCreate = () => auditOnCreateGenerator(keyResultsConfig(getFirestore()));
export const keyResultUpdate = () => auditOnUpdateGenerator(keyResultsConfig(getFirestore()));
export const keyResultDelete = () => auditOnDeleteGenerator(keyResultsConfig(getFirestore()));

export const KPICreate = () => auditOnCreateGenerator(kpiConfig(getFirestore()));
export const KPIUpdate = () => auditOnUpdateGenerator(kpiConfig(getFirestore()));
export const KPIDelete = () => auditOnDeleteGenerator(kpiConfig(getFirestore()));
