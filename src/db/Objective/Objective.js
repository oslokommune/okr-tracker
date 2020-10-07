import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument, validateUpdateProps, updateDocument, deleteDocument } from '../common';
import KeyResult from '../KeyResult';

const collection = db.collection('objectives');

const create = data => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);

  return updateDocument(collection.doc(id), data);
};

const archive = id => update(id, { archived: true });
const restore = id => update(id, { archived: false });

const deleteDeep = async id => {
  // Delete affected key results
  db.collection('keyResults')
    .where('objective', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => KeyResult.deleteDeep(ref.id)));

  return deleteDocument(update, collection.doc(id));
};

export default { create, update, archive, restore, deleteDeep };
