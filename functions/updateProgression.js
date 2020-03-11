const d3 = require('d3');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { getKeyResultsProgressions } = require('./getKeyResultsProgressions');
const paths = require('./paths');
const config = require('./config');

const db = admin.firestore();

exports.handleProgressionUpdates = function(level, type) {
  // Determine which path (Firestore) should be listened on
  let docPath;
  if (type === 'progression') {
    docPath = getProgressionsPath(level);
  } else if (type === 'keyResult') {
    docPath = getKeyresPath(level);
  }

  /**
   * When a change ('write') occurs on the defined path
   * we need to update two documents:
   *  - The related _objective_
   *  - The related _period_
   */
  return functions
    .region(config.region)
    .firestore.document(docPath)
    .onWrite(async (change, context) => {
      const { parentPath, objectivePath } = getPathsFromLevel(level, context);

      await updateObjectiveProgression(objectivePath);
      await updatePeriodProgression(parentPath, objectivePath);
      return true;
    });
};

/**
 * Updates the progression for the parent period for the provided objective
 * @param {String} parentPath
 * @param {String} objectivePath
 * @returns {Promise}
 */
async function updatePeriodProgression(parentPath, objectivePath) {
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

/**
 * Uses the provided level to determine which paths
 * should be returned. Generating paths using ids from
 * the context argument.
 * @param {String} level
 * @param {Object} context
 * @return {Object}
 */
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

/**
 * Saves the new progression to the provided objective
 * @param {String} path - Objective Path
 */
async function updateObjectiveProgression(path) {
  const keyResultsProgressions = await getKeyResultsProgressions(path);
  const progression = d3.mean(keyResultsProgressions);
  const edited = new Date();
  const editedBy = 'cloud-function';

  await db.doc(path).update({ progression, edited, editedBy });
}

/**
 * Returns the correct db path for progressions
 * for the provided level
 * @param {String} level
 * @returns {String} - Path
 */
function getProgressionsPath(level) {
  if (!level) throw new Error('Missing level');

  if (level === 'organization') {
    return paths.organizationProgressionsPath;
  }
  if (level === 'department') {
    return paths.departmentProgressionsPath;
  }
  if (level === 'product') {
    return paths.progressionsPath;
  }
}

/**
 * Returns the correct db path for key results
 * for the provided level
 * @param {String} level
 * @returns {String} - Path
 */
function getKeyresPath(level) {
  if (!level) throw new Error('Missing level');

  if (level === 'organization') {
    return paths.organizationKeyResultsPath;
  }
  if (level === 'department') {
    return paths.departmentKeyResultsPath;
  }
  if (level === 'product') {
    return paths.keyResultsPath;
  }
}
