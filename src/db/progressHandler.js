import { errorHandler } from '../util/utils';
import Audit from './audit';
import * as Toast from '../util/toasts';
import { isTeamMemberOfProduct } from './db';
import Store from '../store';

export default {
  addProgress,
  deleteProgress,
};

/**
 * Saves a progress for a key result
 * @param {KeyResultObject} keyres - serialized key result object
 * @param {Number} value - The new value to be registered
 * @param {Date} date - Optional date for the progress
 * @returns {Promise}
 */
async function addProgress(keyres, value, date) {
  if (!keyres || !keyres.ref) {
    return errorHandler('Corrupt or missing key result object');
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return errorHandler(`Cannot process provided value: ${value}`);
  }

  const documentRef = keyres.ref.parent.parent.parent.parent.parent.parent;
  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('Not allowed to add progress');

  const userRef = Store.state.user.ref;
  const timestamp = date ? new Date(date) : new Date();

  const progressToBeRegistered = {
    value,
    timestamp,
    createdBy: userRef,
    created: new Date(),
    archived: false,
  };

  return keyres.ref
    .collection('progress')
    .add(progressToBeRegistered)
    .then(Toast.addedProgression)
    .then(updateCurrentValue.bind(null, keyres))
    .catch(errorHandler);
}

async function deleteProgress(doc, keyres) {
  if (!doc) throw errorHandler('Missing document');

  const documentRef = doc.ref.parent.parent.parent.parent.parent.parent;
  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);

  if (!hasEditPermissions) throw errorHandler('Not allowed to delete this');

  doc.ref
    .delete()
    .then(Toast.deleted)
    .then(updateCurrentValue.bind(null, keyres))
    .catch(errorHandler);
}

/**
 * Finds the most recent registered value and saves it to the `keyres` object in db
 * @param {KeyResultObject} keyres - serialized key result object
 * @returns {Promise}
 */
async function updateCurrentValue(keyres) {
  if (!keyres) throw errorHandler('Missing document');

  const documentRef = keyres.ref.parent.parent.parent.parent.parent.parent;
  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);

  if (!hasEditPermissions) throw errorHandler('Not allowed to delete this');

  const userRef = Store.state.user.ref;
  const oldValue = keyres.currentValue || keyres.startValue || 0;
  const newValue = await keyres.ref
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then(snapshot => {
      if (!snapshot.docs || !snapshot.docs.length) return null;
      return snapshot.docs[0].data().value;
    })
    .catch(errorHandler);

  if (oldValue === newValue) return;

  const parentDocumentRef = keyres.ref.parent.parent.parent.parent;

  return keyres.ref
    .update({ currentValue: newValue, edited: new Date(), editedBy: userRef })
    .then(() => {
      return Audit.keyResUpdateProgress(keyres.ref, parentDocumentRef, oldValue, newValue);
    })
    .catch(errorHandler);
}
