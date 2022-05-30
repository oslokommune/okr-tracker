import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument, validateUpdateProps, updateDocument, deleteDocument } from '../common';

const collection = db.collection('kpis');

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);
  return updateDocument(collection.doc(id), data);
};

const archive = (id) => update(id, { archived: true });
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
