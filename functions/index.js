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

// exports.updatedKeyResultProgression = functions.firestore.document(progressionsPath).onWrite((change, context) => {
//   const { orgId, departmentId, productId, objectiveId } = context.params;

//   const objectivePath = `orgs/${orgId}/departments/${departmentId}/products/${productId}/objectives/${objectiveId}`;

//   return db
//     .doc(objectivePath)
//     .collection('key_results')
//     .get()
//     .then(d => d.docs);
// });
