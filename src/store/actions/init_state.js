import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, commit }) => {
  return Promise.all([
    bindDocumentsToStore('organizations', commit),
    bindDocumentsToStore('departments', commit),
    bindDocumentsToStore('products', commit),
    bindFirestoreRef('users', db.collection('users'), { serialize, maxRefDepth: 1 }),
  ]);
});

/**
 * Custom serializer for the firestore action. Includes the document's Firestore path
 * and the its progression in the current period
 */
const serialize = (snapshot) => {
  const onProgressionSnapshot = (callback) =>
    db
      .collection('periods')
      .where('archived', '==', false)
      .where('parent', '==', snapshot.ref)
      .where('endDate', '>', new Date())
      .orderBy('endDate')
      .limit(1)
      .onSnapshot(callback);

  const document = snapshot.data();

  Object.defineProperty(document, 'id', { value: snapshot.id });
  Object.defineProperty(document, 'path', { value: snapshot.ref.path });
  Object.defineProperty(document, 'onProgressionSnapshot', { value: onProgressionSnapshot });

  return document;
};

// Not sure how long this will be responsive. There may be some problems when Organizations/Departments/Products are over 100 documents
const bindDocumentsToStore = async (type, commit) => {
  const isNotArchived = ['archived', '==', false];

  await db
    .collection(type)
    .where(...isNotArchived)
    .onSnapshot((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const document = serialize(doc);

        data.push(document);
      });
      commit('SET_COLLECTION', { data, type });
    });
  return true;
};
