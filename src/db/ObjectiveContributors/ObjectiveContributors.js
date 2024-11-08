import { collection, deleteDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import props from './props';
import { createDocument, validateCreateProps } from '../common';

const objectiveContributorsCollection = collection(db, 'objectiveContributors');

const create = async (itemRef, objectiveRef) => {
  if (!(await getDoc(itemRef)).exists()) {
    throw new Error(`Cannot find item with ID ${itemRef.id}`);
  }
  if (!(await getDoc(objectiveRef)).exists()) {
    throw new Error(`Cannot find objcetive with ID ${objectiveRef.id}`);
  }

  const contributors = await getDocs(
    query(
      objectiveContributorsCollection,
      where('objective', '==', objectiveRef),
      where('item', '==', itemRef)
    )
  ).then((snapshot) => snapshot.docs.map((document) => document.ref));

  // Avoid creating duplicates
  if (contributors.length > 0) {
    return contributors[0];
  }

  const data = { item: itemRef, objective: objectiveRef };

  validateCreateProps(props, data);

  return createDocument(objectiveContributorsCollection, data);
};

const remove = async (itemRef, objectiveRef) => {
  await getDocs(
    query(
      objectiveContributorsCollection,
      where('item', '==', itemRef),
      where('objective', '==', objectiveRef)
    )
  ).then((snapshot) => {
    if (snapshot.docs.length < 1) {
      throw new Error(
        `ObjectiveContributors for item ${itemRef.id} and objective ${objectiveRef.id} not found; cannot delete`
      );
    }
    snapshot.forEach((doc) => deleteDoc(doc.ref));
  });
};

export default { create, remove };
