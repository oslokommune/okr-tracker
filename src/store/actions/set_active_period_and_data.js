import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import getActiveItemType from '@/util/getActiveItemType';

export default firestoreAction(
  async ({ bindFirestoreRef, unbindFirestoreRef }, { periodId, item }) => {
    if (!periodId && !item) {
      unbindFirestoreRef('periods');
      unbindFirestoreRef('objectives');
      unbindFirestoreRef('objectiveContributors');
      unbindFirestoreRef('activePeriod');
      return false;
    }

    let parentRef = null;

    if (periodId) {
      const activePeriodRef = db.collection('periods').doc(periodId);
      await bindFirestoreRef('activePeriod', activePeriodRef, { maxRefDepth: 0 });
      parentRef = await activePeriodRef.get().then((snapshot) => snapshot.data().parent);
    } else {
      const itemType = getActiveItemType(item);
      parentRef = db.collection(`${itemType}s`).doc(item.id);
    }

    const objectivesRef = db
      .collection('objectives')
      .where('archived', '==', false)
      .where('parent', '==', parentRef)
      .orderBy('name');

    const objectiveContributorsRef = db
      .collection('objectiveContributors')
      .where('item', '==', parentRef);

    const activeObjectivesList = await objectivesRef
      .get()
      .then((snapshot) => snapshot.docs.map((doc) => doc.ref));

    const objectiveContributorsList = await objectiveContributorsRef
      .get()
      .then((snapshot) => snapshot.docs.map((doc) => doc.ref));

    if (activeObjectivesList.length || objectiveContributorsList.length) {
      await bindFirestoreRef('objectives', objectivesRef, { maxRefDepth: 1 });
      await bindFirestoreRef('objectiveContributors', objectiveContributorsRef, {
        maxRefDepth: 1,
      });
    } else {
      unbindFirestoreRef('objectives');
      unbindFirestoreRef('objectiveContributors');
    }

    return true;
  }
);
