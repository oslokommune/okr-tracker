import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

/**
 * When navigating to an organization, department or product, the 'item' is stored along with its
 * related data (its own reference, periods, objectives, key results, kpis) in the store.
 */
export default firestoreAction(async ({ bindFirestoreRef }) => {
  const userRefs = db.collection('users').orderBy('id', 'asc');

  await bindFirestoreRef('users', userRefs, { maxRefDepth: 1 });

  return true;
});
