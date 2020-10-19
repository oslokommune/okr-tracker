const functions = require('firebase-functions');
const config = require('../config');
const { handleKeyResultProgress, updatePeriodProgression } = require('./handleKeyResultProgress');

exports.handleKeyResultProgress = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}/progress/{documentId}`)
  .onWrite(handleKeyResultProgress);

exports.handleKeyResultProgressOnKeyResultUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}`)
  .onUpdate(({ before, after }, context) => {
    const fields = ['startValue', 'targetValue', 'currentValue', 'weight'];

    const fieldsHaveChanged = fields.some(field => before.data()[field] !== after.data()[field]);

    if (fieldsHaveChanged) return handleKeyResultProgress(null, context);

    return true;
  });

exports.handleKeyResultProgressOnObjectiveUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`objectives/{objectiveId}`)
  .onUpdate(({ before, after }) => {
    if (before.data().weight === after.data().weight) return false;

    const { period } = after.data();
    return updatePeriodProgression(period);
  });
