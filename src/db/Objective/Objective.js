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
  data.progression = 0;
  return createDocument(collection(db, 'objectives'), data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);
  return updateDocument(doc(db, 'objectives', id), data);
};

const archive = (id) => update(id, { archived: true });
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
