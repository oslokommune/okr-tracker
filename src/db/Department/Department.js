import { collection, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import props from './props';
import {
  validateCreateProps,
  createDocument,
  validateUpdateProps,
  updateDocument,
} from '../common';

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }

  return createDocument(collection(db, 'departments'), data);
};

const update = async (id, data) => {
  validateUpdateProps(props, data);
  return updateDocument(doc(db, 'departments', id), data);
};

const archive = (id) => update(id, { archived: true });
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
