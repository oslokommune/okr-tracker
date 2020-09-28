import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

/**
 * When navigating to an organization, department or product, the 'item' is stored along with its
 * related data (its own reference, periods, objectives, key results, kpis) in the store.
 */
export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef, commit, dispatch, state }, item) => {
  if (!item) {
    return unbindFirestoreRef('activeItem');
  }

  if (state.activeItemRef && item.id === state.activeItemRef.id) return true;

  // Store the document reference
  commit('SET_ACTIVE_ITEM_REF', item);

  const periodsRef = db.collection('periods').where('archived', '==', false).where('parent', '==', item);
  const kpisRef = db.collection('kpis').where('parent', '==', item);

  const filterPeriodsIncludeToday = doc => {
    const now = new Date();
    const { startDate, endDate } = doc.data();
    if (startDate.toDate() > now) return false;
    if (endDate.toDate() < now) return false;
    return true;
  };

  const activePeriodRef = await periodsRef
    .get()
    .then(snapshot => snapshot.docs.filter(filterPeriodsIncludeToday))
    .then(list => (list[0] && list[0].ref ? list[0].ref : null));

  await bindFirestoreRef('activeItem', item, { maxRefDepth: 1 });
  await bindFirestoreRef('periods', periodsRef, { maxRefDepth: 0 });
  await dispatch('set_active_period_and_data', activePeriodRef.id);
  await bindFirestoreRef('kpis', kpisRef, { maxRefDepth: 0 });

  return true;
});
