import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(
  async ({ bindFirestoreRef, unbindFirestoreRef, state }, id) => {
    if (!id) {
      return unbindFirestoreRef('activeKeyResult');
    }
    const reference = db.collection('keyResults').doc(id);
    const refData = await reference.get().then((snapshot) => snapshot.data());

    if (!refData) {
      return unbindFirestoreRef('activeKeyResult');
    }

    const objective = refData.objective;

    if (!state.activeObjective || state.activeObjective.id !== objective.id) {
      await bindFirestoreRef('activeObjective', objective, { maxRefDepth: 1 });
    }

    return bindFirestoreRef('activeKeyResult', reference, { maxRefDepth: 2 });
  }
);
