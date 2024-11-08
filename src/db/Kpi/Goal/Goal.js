import { collection, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import props from './props';
import {
  createDocument,
  updateDocument,
  validateCreateProps,
  validateUpdateProps,
} from '../../common';

async function create(kpiId, data) {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }

  return createDocument(collection(db, 'kpis', kpiId, 'goals'), data);
}

async function update(kpiId, goalId, data) {
  validateUpdateProps(props, data);
  return updateDocument(doc(db, 'kpis', kpiId, 'goals', goalId), data);
}

async function archive(kpiId, goalId) {
  return update(kpiId, goalId, { archived: true });
}

async function restore(kpiId, goalId) {
  return update(kpiId, goalId, { archived: false });
}

export default { create, update, archive, restore };
