import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    return unbindFirestoreRef('activeObjective');
  }
  const reference = db.collection('objectives').doc(id);

  return bindFirestoreRef('activeObjective', reference, { maxRefDepth: 1 });
});
