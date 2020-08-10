import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef }) => {
  const isNotArchived = ['archived', '==', false];
  const options = {
    maxRefDepth: 1,
    serialize,
  };

  return Promise.all([
    bindFirestoreRef('organizations', db.collection('organizations').where(...isNotArchived), options),
    bindFirestoreRef('departments', db.collection('departments').where(...isNotArchived), options),
    bindFirestoreRef('products', db.collection('products').where(...isNotArchived), options),
  ]);
});

/**
 * Custom serializer for the firestore action. Includes the document's Firestore path
 * and the its progression in the current period
 */
function serialize(snapshot) {
  const onProgressionSnapshot = callback =>
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
}
