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

  const { ref } = await db.collection('kpis').doc(kpiId).get();

  return createDocument(ref.collection('goals'), data);
};

async function get(kpiId, goalId) {
  const { ref } = await db.collection('kpis').doc(kpiId).get();
  return ref.collection('goals').doc(goalId);
};

async function update(kpiId, goalId, data) {
  validateUpdateProps(props, data);

  const goal = await get(kpiId, goalId);

  return updateDocument(goal, data);
};

async function archive(kpiId, goalId) {
  const goal = await get(kpiId, goalId);

  return goal.update({ archived: true });
};

async function restore(kpiId, goalId) {
  const goal = await get(kpiId, goalId);

  return goal.update({ archived: false });
};

export default { create, update, archive, restore };
