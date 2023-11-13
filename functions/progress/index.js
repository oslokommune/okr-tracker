import functions from 'firebase-functions';
import config from '../config.js';
import { updateKeyResultProgress } from './handleKeyResultProgress.js';

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
