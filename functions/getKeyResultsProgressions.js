const admin = require('firebase-admin');
const d3 = require('d3');

const db = admin.firestore();

/**
 * Finds all progressions for key results related to the Objective
 * @param {String} path - path to objective
 * @returns {Promise} - Resolves to a list of decimal numbers
 */
exports.getKeyResultsProgressions = async function(path) {
  const progression = await db
    .doc(path)
    .collection('keyResults')
    .where('archived', '==', false)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()))
    .then(list => list.map(getProgressionPercentage));

  return progression.length ? progression : [0];
};

/**
 * Finds the progress in percent for a key result object
 * @param {Object} keyres - key result document
 * @return {Number} - Between 0 and 1
 */
function getProgressionPercentage(keyres) {
  /* eslint-disable-next-line */
  const { targetValue, startValue } = keyres;
  const currentValue = keyres.currentValue || 0;

  const scale = d3
    .scaleLinear()
    .domain([startValue, targetValue]) /* eslint-disable-line */
    .clamp(true);
  return scale(currentValue) || 0;
}
