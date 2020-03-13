import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import { errorHandler } from '@/util/utils';
import { isTeamMemberOfProduct } from '@/db/db';
import Store from '@/store';
import { functions } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';

/**
 * Creates a key result for the provided objective
 * @param {DocumentReference} objectiveRef - The parent objective
 * @param {Object} data - Data for the key result
 */
async function create(objectiveRef, data) {
  const defaultData = {
    archived: false,
    description: i18n.t('keyresHandler.description'),
    startValue: 0,
    targetValue: 100,
    created: new Date(),
    createdBy: Store.state.user.ref,
    unit: '',
  };
  data = data || defaultData;

  const documentRef = objectiveRef.parent.parent;

  const keyResCount = await objectiveRef
    .collection('keyResults')
    .where('archived', '==', false)
    .get()
    .then(snapshot => snapshot.docs.length);

  if (keyResCount >= 5) {
    Toast.show(i18n.t('keyresHandler.keyresCap'));
    return errorHandler('create_keyres_error', new Error(i18n.t('keyresHandler.mazSizeError')));
  }

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('create_keyres_error', new Error(i18n.t('errorHandler.insufficient')));

  return objectiveRef
    .collection('keyResults')
    .add(data)
    .then(async keyresRef => {
      Toast.addedKeyResult();
      Audit.createKeyResult(keyresRef, documentRef, objectiveRef);

      if (data.auto) {
        const myCall = await functions.httpsCallable('triggerScheduledFunction');
        await myCall(keyresRef.path).catch(err => {
          throw new Error(err);
        });
      }

      return keyresRef;
    })
    .catch(err => {
      errorHandler('create_keyres_error', err);
    });
}

/**
 * Updates an key result with the provided data
 * @param {DocumentReference} keyresRef - key result reference
 * @param {Object} data - data to be updated
 * @returns {Promise}
 */
async function update(keyresRef, data) {
  const objectiveRef = keyresRef.parent.parent;
  const documentRef = objectiveRef.parent.parent;

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('update_keyres_error', new Error(i18n.t('errorHandler.insufficient')));

  data.auto = data.auto ? data.auto : false;
  data.sheetId = data.sheetId ? data.sheetId : false;
  data.sheetCell = data.sheetCell ? data.sheetCell : false;
  data.sheetName = data.sheetName ? data.sheetName : false;

  return keyresRef
    .update(data)
    .then(() => {
      Audit.updateKeyResult(keyresRef, documentRef, objectiveRef);
      Toast.savedChanges();
      return keyresRef;
    })
    .catch(err => {
      errorHandler('update_keyres_error', err);
    });
}

/**
 * Archives a key result
 * @param {DocumentReference} keyresRef - key result reference
 */
async function archive(keyresRef) {
  const objectiveRef = keyresRef.parent.parent;
  const documentRef = objectiveRef.parent.parent;

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('archive_keyres_error', new Error(i18n.t('errorHandler.insufficient')));

  await keyresRef
    .update({ archived: true })
    .then(() => {
      Toast.deletedRegret({ ref: keyresRef });
      Audit.archiveKeyResult(keyresRef, documentRef, objectiveRef);
      return true;
    })
    .catch(err => {
      errorHandler('archive_keyres_error', err);
    });
}

export default {
  create,
  update,
  archive,
};
