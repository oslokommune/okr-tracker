const d3 = require('d3');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const getKeyResultsProgressions = require('./getKeyResultsProgressions');
const { organizationProgressionsPath, departmentProgressionsPath, progressionsPath } = require('./paths');

const region = 'europe-west2';

const db = admin.firestore();

exports.updatedKeyRes = function(level) {
  let path;
  if (level === 'organization') {
    path = organizationProgressionsPath;
  } else if (level === 'department') {
    path = departmentProgressionsPath;
  } else if (level === 'product') {
    path = progressionsPath;
  } else {
    return;
  }

  return functions
    .region(region)
    .firestore.document(path)
    .onWrite(async (change, context) => {
      const { parentPath, objectivePath } = getPathsFromLevel(level, context);

      await onWriteHandler(parentPath, objectivePath);
      return true;
    });
};

async function onWriteHandler(parentPath, objectivePath) {
  const keyResultsProgressions = await getKeyResultsProgressions(objectivePath);
  const progression = d3.mean(keyResultsProgressions);
  const edited = new Date();
  const editedBy = 'cloud-function';

  await db.doc(objectivePath).update({ progression, edited, editedBy });

  const period = await db
    .doc(objectivePath)
    .get()
    .then(snapshot => snapshot.data().period);

  // Get the average progression for all objectives
  // in the same period
  const periodProgression = await db
    .doc(parentPath)
    .collection('objectives')
    .where('archived', '==', false)
    .where('period', '==', period)
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data().progression))
    .then(values => d3.mean(values));

  return period.update({ progression: periodProgression });
}

function getPathsFromLevel(level, context) {
  const { orgId, productId, departmentId, objectiveId } = context.params;
  let parentPath;
  let objectivePath;
  if (level === 'organization') {
    parentPath = `orgs/${orgId}`;
    objectivePath = `${parentPath}/objectives/${objectiveId}`;
  } else if (level === 'department') {
    parentPath = `orgs/${orgId}/departments/${departmentId}`;
    objectivePath = `${parentPath}/objectives/${objectiveId}`;
  } else if (level === 'product') {
    parentPath = `orgs/${orgId}/departments/${departmentId}/products/${productId}`;
    objectivePath = `${parentPath}/objectives/${objectiveId}`;
  } else {
    return;
  }
  return { parentPath, objectivePath };
}
