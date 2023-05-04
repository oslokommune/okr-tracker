import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef }, objectiveId) => {
  const objectiveRef = await db.collection('objectives').doc(objectiveId);

  const keyResultsRef = db
    .collection('keyResults')
    .where('archived', '==', false)
    .where('objective', '==', objectiveRef)
    .orderBy('name');

  await bindFirestoreRef('keyResults', keyResultsRef, { maxRefDepth: 0 });

  return true;
});
