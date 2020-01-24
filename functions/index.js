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
/* eslint-enable */

exports.updatedKeyResultProgression = functions.firestore
  .document(progressionsPath)
  .onWrite(async (change, context) => {
    const { orgId, departmentId, productId, objectiveId } = context.params;
    const objectivePath = `orgs/${orgId}/departments/${departmentId}/products/${productId}/objectives/${objectiveId}`;

    const keyResultsProgressions = await db
      .doc(objectivePath)
      .collection('key_results')
      .where('archived', '==', false)
      .get()
      .then(collection => collection.docs.map(doc => doc.data()))
      .then(list => list.map(getProgressionPercentage));

    const progression = d3.mean(keyResultsProgressions);

    return db.doc(objectivePath).update({ progression });
  });

function getProgressionPercentage(keyres) {
  /* eslint-disable-next-line */
  const { target_value, start_value, currentValue } = keyres;
  const scale = d3
    .scaleLinear()
    .domain([start_value, target_value]) /* eslint-disable-line */
    .clamp(true);
  return scale(currentValue);
}

exports.updatedObjectiveProgression = functions.firestore.document(objectivesPath).onUpdate(async (change, context) => {
  const { orgId, departmentId, productId } = context.params;
  const productPath = `orgs/${orgId}/departments/${departmentId}/products/${productId}`;

  // Find all objectives for this product
  const objectiveProgressions = await db
    .doc(productPath)
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

  // Update the product with the progressions object
  await db.doc(productPath).update({
    progressions,
  });

  return true;
});
