import firebase from 'firebase/compat/app';
import { db } from '@/config/firebaseConfig';
import props from './props';
import {
  validateCreateProps,
  createDocument,
  validateUpdateProps,
  updateDocument,
} from '../common';

const collection = db.collection('kpis');

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);
  if (!data.auto) {
    // Ensure that Google Sheets sync state is reset if disabled.
    const { FieldValue } = firebase.firestore;
    data.error = FieldValue.delete();
    data.valid = true;
  }
  return updateDocument(collection.doc(id), data);
};

const archive = (id) => update(id, { archived: true });
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
