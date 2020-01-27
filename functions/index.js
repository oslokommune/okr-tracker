const d3 = require('d3');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

/* eslint-disable  */
const orgsPath = 'orgs/{orgId}';
const departmentsPath = orgsPath + '/departments/{departmentId}';
const productsPath = departmentsPath + '/products/{productId}';
const objectivesPath = productsPath + '/objectives/{objectiveId}';
const keyResultsPath = objectivesPath + '/key_results/{keyresId}';
const progressionsPath = keyResultsPath + '/progression/{progressionId}';
const departmentObjectivesPath = departmentsPath + '/objectives/{objectiveId}';
const departmentKeyResultsPath = departmentObjectivesPath + '/key_results/{keyResId}';
const departmentProgressionsPath = departmentKeyResultsPath + '/progression/{progressionId}';
/* eslint-enable */

exports.updatedKeyResultProgression = functions.firestore
  .document(progressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, productId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/products/${productId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const edited_by = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, edited_by });
  });

exports.updatedDepartmentKeyResultProgression = functions.firestore
  .document(departmentProgressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
    const progression = d3.mean(keyResultsProgressions);
    const edited = new Date();
    const edited_by = 'cloud-function';

    return db.doc(objectivePath).update({ progression, edited, edited_by });
  });

/**
 * Finds all progressions for key results related to the Objective
 * @param {String} path - path to objective
 * @returns {Promise} - Resolves to a list of decimal numbers
 */
async function getKeyResultsProgressions(path) {
  return db
    .doc(path)
    .collection('key_results')
    .where('archived', '==', false)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()))
    .then(list => list.map(getProgressionPercentage));
}

/**
 * Finds the progress in percent for a key result object
 * @param {Object} keyres - key result document
 * @return {Number} - Between 0 and 1
 */
function getProgressionPercentage(keyres) {
  /* eslint-disable-next-line */
  const { target_value, start_value, currentValue } = keyres;
  const scale = d3
    .scaleLinear()
    .domain([start_value, target_value]) /* eslint-disable-line */
    .clamp(true);
  return scale(currentValue);
}

// Triggers when a product's objective is changed (i.e. progression)
exports.updatedObjectiveProgression = functions.firestore.document(objectivesPath).onUpdate(async (change, context) => {
  const { orgId, departmentId, productId } = context.params;
  const productPath = `orgs/${orgId}/departments/${departmentId}/products/${productId}`;
  const progressions = await getObjectiveProgressions(productPath);
  const edited = new Date();
  const edited_by = 'cloud-function';

  await db.doc(productPath).update({ progressions, edited, edited_by });
  return true;
});

// Triggers when a department's objective is changed (i.e. progression)
exports.updatedDepartmentObjectiveProgression = functions.firestore
  .document(departmentObjectivesPath)
  .onUpdate(async (change, context) => {
    const { orgId, departmentId } = context.params;
    const departmentPath = `orgs/${orgId}/departments/${departmentId}`;
    const progressions = await getObjectiveProgressions(departmentPath);
    const edited = new Date();
    const edited_by = 'cloud-function';

    await db.doc(departmentPath).update({ progressions, edited, edited_by });

    return true;
  });

/**
 * Finds the progressions for each quarter for a department
 * or a product. Returns an object with the quarter names as keys.
 * @param {String} path - Path to product or deparment
 * @returns {Object} - Dictionary of progressions for each quarter
 */
async function getObjectiveProgressions(path) {
  const objectiveProgressions = await db
    .doc(path)
    .collection('objectives')
    .where('archived', '==', false)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()));

  // Nest objectives by quarter
  const progressionsList = d3
    .nest()
    .key(d => d.quarter)
    .rollup(list => d3.mean(list.map(obj => obj.progression)))
    .entries(objectiveProgressions)
    .map(d => {
      const { key, value } = d;
      const obj = {};
      obj[key] = value;
      return obj;
    });

  // Convert array to object with quarter name as key
  const progressions = {};
  progressionsList.forEach(d => {
    const key = Object.keys(d)[0];
    progressions[key] = d[key];
  });

  return progressions;
}
