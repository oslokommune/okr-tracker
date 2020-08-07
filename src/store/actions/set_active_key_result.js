import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    return unbindFirestoreRef('activeKeyResult');
  }
  const reference = db.collection('keyResults').doc(id);

  return bindFirestoreRef('activeKeyResult', reference, { maxRefDepth: 1 });
});
