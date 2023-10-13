import { db } from '@/config/firebaseConfig';
import props from './props';
import { createDocument, validateCreateProps } from '../common';

const collection = db.collection('objectiveContributors');

const create = async (itemRef, objectiveRef) => {
  if (await itemRef.get().then(({ exists }) => !exists)) {
    throw new Error(`Cannot find item with ID ${itemRef.id}`);
  }
  if (await objectiveRef.get().then(({ exists }) => !exists)) {
    throw new Error(`Cannot find objcetive with ID ${objectiveRef.id}`);
  }

  const contributors = await db
    .collection('objectiveContributors')
    .where('objective', '==', objectiveRef)
    .where('item', '==', itemRef)
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.ref));

  // Avoid creating duplicates
  if (contributors.length > 0) {
    return contributors[0];
  }

  const data = { item: itemRef, objective: objectiveRef };

  validateCreateProps(props, data);

  return createDocument(collection, data);
};

const remove = async (itemRef, objectiveRef) => {
  collection
    .where('item', '==', itemRef)
    .where('objective', '==', objectiveRef)
    .get()
    .then((snapshot) => {
      if (snapshot.docs.length < 1) {
        throw new Error(
          `ObjectiveContributors for item ${itemRef.id} and objective ${objectiveRef.id} not found; cannot delete`
        );
      }
      snapshot.forEach((doc) => doc.ref.delete());
    });
};

export default { create, remove };
