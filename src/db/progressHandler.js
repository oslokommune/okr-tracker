import * as Toast from '@/util/toasts';
import { isTeamMemberOfProduct } from '@/db/db';
import Store from '@/store';
import i18n from '@/locale/i18n';

import { logHandler, errorHandler } from '@/util/utils';

/**
 * Saves a progress for a key result
 * @param {KeyResultObject} keyres - serialized key result object
 * @param {Number} value - The new value to be registered
 * @param {Date} date - Optional date for the progress
 * @returns {Promise}
 */
export async function addProgress(keyres, value, date, addComment) {
  if (!keyres || !keyres.ref) {
    return errorHandler('add_progress_error', new Error(i18n.t('errorHandler.missingKeyRes')));
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return errorHandler('add_progress_error', new Error(i18n.t('errorHandler.process', null, { value })));
  }

  let documentRef;
  const grandParent = keyres.ref.parent.parent.parent.parent;
  if (grandParent.parent.id === 'products') {
    documentRef = grandParent;
  } else {
    documentRef = grandParent.parent.parent;
  }

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('add_progress_error', new Error(i18n.t('errorHandler.noAdding')));

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
    .then(response => {
      Toast.addedProgression(addComment, response);
      return response;
    })
    .then(() => {
      logHandler('add_progress');
    })
    .catch(err => {
      errorHandler('add_progress_error', err);
    });
}

export async function deleteProgress(doc) {
  if (!doc) throw errorHandler('delete_progress_error', new Error(i18n.t('errorHandler.missing')));

  const documentRef = doc.ref.parent.parent.parent.parent.parent.parent;
  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);

  if (!hasEditPermissions) throw errorHandler('delete_progress_error', new Error(i18n.t('errorHandler.noDeletion')));

  doc.ref
    .delete()
    .then(Toast.deleted)
    .then(() => logHandler('delete_progress'))
    .catch(err => {
      errorHandler('delete_progress_error', err);
    });
}
