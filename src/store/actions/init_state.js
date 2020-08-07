import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef }) => {
  const isNotArchived = ['archived', '==', false];

  return Promise.all([
    bindFirestoreRef('organizations', db.collection('organizations').where(...isNotArchived), { maxRefDepth: 1 }),
    bindFirestoreRef('departments', db.collection('departments').where(...isNotArchived), { maxRefDepth: 1 }),
    bindFirestoreRef('products', db.collection('products').where(...isNotArchived), { maxRefDepth: 1 }),
  ]);
});
