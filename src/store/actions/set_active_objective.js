import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    return unbindFirestoreRef('activeObjective');
  }
  const reference = db.collection('objectives').doc(id);

  try {
    await bindFirestoreRef('activeObjective', reference, { maxRefDepth: 1 });
  } catch (error) {
    throw new Error(error);
  }
});
