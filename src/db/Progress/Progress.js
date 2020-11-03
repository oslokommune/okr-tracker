import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument } from '../common';

const keyResults = db.collection('keyResults');

const create = async (keyResultId, data) => {
  if (!keyResultId) {
    throw new Error('Missing ID');
  }
  if (typeof keyResultId !== 'string') {
    throw new Error('ID must be a string');
  }

  try {
    const keyResRef = keyResults.doc(keyResultId);

    if (await keyResRef.get().then(({ exists }) => !exists)) {
      throw new Error(`Cannot find key result with ID ${keyResultId}`);
    }

    validateCreateProps(props, data);
    data.timestamp = data.timestamp || new Date();

    const now = new Date().getTime();
    if (data.timestamp.getTime() > now) {
      throw new Error('Timestamp cannot be set in the future');
    }

    return createDocument(keyResRef.collection('progress'), data);
  } catch (error) {
    throw new Error(error);
  }
};

const remove = async (keyResultId, progressId) => {
  try {
    return keyResults.doc(`${keyResultId}/progress/${progressId}`).delete();
  } catch {
    throw new Error(`Cannot remove progress (${progressId}) from key result ${keyResultId}`);
  }
};

export default { create, remove };
