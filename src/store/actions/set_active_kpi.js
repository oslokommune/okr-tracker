import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    return unbindFirestoreRef('activeKpi');
  }
  const reference = db.collection('kpis').doc(id);

  return bindFirestoreRef('activeKpi', reference, { maxRefDepth: 0 });
});
