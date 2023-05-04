import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    unbindFirestoreRef('periods');
    unbindFirestoreRef('objectives');
    unbindFirestoreRef('ownKeyResults');
    unbindFirestoreRef('activePeriod');
    return false;
  }

  const activePeriodRef = db.collection('periods').doc(id);
  await bindFirestoreRef('activePeriod', activePeriodRef, { maxRefDepth: 0 });

  const parentRef = await activePeriodRef
    .get()
    .then((snapshot) => snapshot.data().parent);

  const objectivesRef = db
    .collection('objectives')
    .where('archived', '==', false)
    .where('parent', '==', parentRef)
    .orderBy('name');

  const activeObjectivesList = await objectivesRef
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.ref));

  if (activeObjectivesList.length) {
    await bindFirestoreRef('objectives', objectivesRef, { maxRefDepth: 1 });
  } else {
    unbindFirestoreRef('objectives');
  }

  const keyResultsRef = db
    .collection('keyResults')
    .where('archived', '==', false)
    .where('parent', '==', parentRef)
    .orderBy('name');

  await bindFirestoreRef('ownKeyResults', keyResultsRef, { maxRefDepth: 0 });

  return true;
});
