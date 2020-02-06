import * as Toast from '../util/toasts';
import Audit from './audit';
import { errorHandler } from '../util/utils';
import { isTeamMemberOfProduct } from './db';
import Store from '../store';

/**
 * Creates a key result for the provided objective
 * @param {DocumentReference} objectiveRef - The parent objective
 * @param {Object} data - Data for the key result
 */
async function create(objectiveRef, data) {
  const user = Store.state.user.email;
  const route = '';

  const defaultData = {
    archived: false,
    description: 'Beskriv nøkkelresultatet',
    startValue: 0,
    targetValue: 100,
    created: new Date(),
    createdBy: Store.state.user.ref,
    unit: '',
  };
  data = data || defaultData;

  const documentRef = objectiveRef.parent.parent;

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('create_keyres', user, route, 'Insufficient permissions');

  return objectiveRef
    .collection('keyResults')
    .add(data)
    .then(keyresRef => {
      Toast.addedKeyResult();
      Audit.createKeyResult(keyresRef, documentRef, objectiveRef);
      return keyresRef;
    })
    .catch(err => {
      errorHandler('create_keyres', user, route, err);
    });
}

/**
 * Updates an key result with the provided data
 * @param {DocumentReference} keyresRef - key result reference
 * @param {Object} data - data to be updated
 * @returns {Promise}
 */
async function update(keyresRef, data) {
  const user = Store.state.user.email;
  const route = '';

  const objectiveRef = keyresRef.parent.parent;
  const documentRef = objectiveRef.parent.parent;

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('update_keyres', user, route, 'Insufficient permissions');

  return keyresRef
    .update(data)
    .then(() => {
      Audit.updateKeyResult(keyresRef, documentRef, objectiveRef);
      Toast.savedChanges();
      return keyresRef;
    })
    .catch(err => {
      errorHandler('update_keyres', user, route, err);
    });
}

/**
 * Archives a key result
 * @param {DocumentReference} keyresRef - key result reference
 */
async function archive(keyresRef) {
  const user = Store.state.user.email;
  const route = '';

  const objectiveRef = keyresRef.parent.parent;
  const documentRef = objectiveRef.parent.parent;

  const hasEditPermissions = await isTeamMemberOfProduct(documentRef);
  if (!hasEditPermissions) throw errorHandler('archive_keyres', user, route, 'Insufficient permissions');

  await keyresRef
    .update({ archived: true })
    .then(() => {
      Toast.deletedRegret({ ref: keyresRef });
      Audit.archiveKeyResult(keyresRef, documentRef, objectiveRef);
      return true;
    })
    .catch(err => {
      errorHandler('archive_keyres', user, route, err);
    });
}

export default {
  create,
  update,
  archive,
};
