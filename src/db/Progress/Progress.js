import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import props from './props';
import {
  createDocument,
  updateDocument,
  validateCreateProps,
  validateUpdateProps,
} from '../common';

function checkReferences(collectionRef, parentId) {
  if (!(collectionRef instanceof CollectionReference)) {
    throw new Error('Invalid collection reference');
  }
  if (!parentId) {
    throw new Error('Missing parent ID');
  }
  if (typeof parentId !== 'string') {
    throw new Error('Parent ID must be a string');
  }
}

const create = async (collectionRef, parentId, data) => {
  checkReferences(collectionRef, parentId);

  try {
    const parentRef = doc(collectionRef, parentId);

    if (!(await getDoc(parentRef)).exists()) {
      throw new Error(`Cannot find parent with ID ${parentId}`);
    }

    validateCreateProps(props, data);
    data.timestamp = data.timestamp || new Date();

    const now = new Date().getTime();
    if (data.timestamp.getTime() > now) {
      throw new Error('Timestamp cannot be set in the future');
    }

    return createDocument(collection(parentRef, 'progress'), data);
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (collectionRef, parentId, progressId, data) => {
  checkReferences(collectionRef, parentId);
  validateUpdateProps(props, data);

  if (data.timestamp.getTime() > new Date().getTime()) {
    throw new Error('Timestamp cannot be set in the future');
  }

  return updateDocument(doc(collectionRef, parentId, 'progress', progressId), data);
};

const remove = async (collectionRef, parentId, progressId) => {
  checkReferences(collectionRef, parentId);

  try {
    return deleteDoc(doc(collectionRef, parentId, 'progress', progressId));
  } catch {
    throw new Error(
      `Cannot remove progress (${progressId}) from ${collectionRef.id} ${parentId}`
    );
  }
};

export default { create, remove, update };
