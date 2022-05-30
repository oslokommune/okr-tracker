import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument, validateUpdateProps, updateDocument, deleteDocument } from '../common';
import KeyResult from '../KeyResult';

const collection = db.collection('objectives');

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  data.progression = 0;
  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);

  return updateDocument(collection.doc(id), data);
};

const archive = (id) => {
  db.collection('keyResults')
    .where('objective', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => KeyResult.archive(ref.id)));

  update(id, { archived: true });
};
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
