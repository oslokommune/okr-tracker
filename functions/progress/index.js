const functions = require('firebase-functions');
const config = require('../config');
const { handleKeyResultProgress, updatePeriodProgression } = require('./handleKeyResultProgress');

exports.handleKeyResultProgress = functions
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}/progress/{documentId}`)
  .onWrite(handleKeyResultProgress);

exports.handleKeyResultProgressOnKeyResultUpdate = functions
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}`)
  .onUpdate(({ before, after }, context) => {
    const fields = ['startValue', 'targetValue', 'currentValue', 'weight'];

    const fieldsHaveChanged = fields.some(field => before.data()[field] !== after.data()[field]);

    if (fieldsHaveChanged) return handleKeyResultProgress(null, context);

    return true;
  });

exports.handleKeyResultProgressOnObjectiveUpdate = functions
  .region(config.region)
  .firestore.document(`objectives/{objectiveId}`)
  .onUpdate(({ before, after }) => {
    if (before.data().weight === after.data().weight) return;

    const { period } = after.data();
    return updatePeriodProgression(period);
  });
