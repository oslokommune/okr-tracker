import store from '@/store'; // eslint-disable-line
import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, id) => {
  if (!id) {
    return unbindFirestoreRef('activeKeyResult');
  }
  const reference = db.collection('keyResults').doc(id);

  const { objective } = await reference.get().then(snapshot => snapshot.data());

  if (!store.state.activeObjective || store.state.activeObjective.id !== objective.id) {
    await bindFirestoreRef('activeObjective', objective, { maxRefDepth: 1 });
  }

  return bindFirestoreRef('activeKeyResult', reference, { maxRefDepth: 1 });
});
