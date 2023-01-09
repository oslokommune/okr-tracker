import functions from 'firebase-functions';
import config from '../config.js';
import {
  updateKeyResultProgress,
  updatePeriodProgression,
} from './handleKeyResultProgress.js';

export const handleKeyResultProgress = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}/progress/{documentId}`)
  .onWrite(updateKeyResultProgress);

export const handleKeyResultProgressOnKeyResultUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}`)
  .onUpdate(({ before, after }, context) => {
    const fields = ['startValue', 'targetValue', 'currentValue', 'weight', 'archived'];

    const fieldsHaveChanged = fields.some(
      (field) => before.data()[field] !== after.data()[field]
    );

    if (fieldsHaveChanged) {
      return handleKeyResultProgress(null, context);
    }

    return true;
  });

export const handleKeyResultProgressOnObjectiveUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`objectives/{objectiveId}`)
  .onUpdate(({ before, after }) => {
    const beforeData = before.data();
    const afterData = after.data();

    const weightChanged = beforeData.weight !== afterData.weight;
    const periodChanged = beforeData.period !== afterData.period;

    if (!weightChanged && !periodChanged) {
      return false;
    }

    return updatePeriodProgression(afterData.period).then(() => {
      // Update progression for both periods when an objective's period is altered.
      if (!periodChanged) {
        return false;
      }

      return updatePeriodProgression(beforeData.period);
    });
  });
