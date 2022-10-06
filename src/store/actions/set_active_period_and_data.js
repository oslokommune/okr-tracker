import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    unbindFirestoreRef('periods');
    unbindFirestoreRef('objectives');
    unbindFirestoreRef('keyResults');
    unbindFirestoreRef('activePeriod');
    return false;
  }

  const activePeriodRef = db.collection('periods').doc(id);
  await bindFirestoreRef('activePeriod', activePeriodRef, { maxRefDepth: 0 });

  const objectivesRef = db
    .collection('objectives')
    .where('archived', '==', false)
    .where('period', '==', activePeriodRef)
    .orderBy('name');

  const activeObjectivesList = await objectivesRef.get().then((snapshot) => snapshot.docs.map((doc) => doc.ref));

  if (activeObjectivesList.length) {
    const parentRef = await activePeriodRef.get().then((snapshot) => snapshot.data().parent);
    const keyResultsRef = db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('parent', '==', parentRef)
      .orderBy('name');

    await bindFirestoreRef('objectives', objectivesRef, { maxRefDepth: 0 });
    await bindFirestoreRef('keyResults', keyResultsRef, { maxRefDepth: 0 });
  } else {
    unbindFirestoreRef('objectives');
    unbindFirestoreRef('keyResults');
  }

  return true;
});
