import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

/**
 * When navigating to an organization, department or product, the 'item' is stored along with its
 * related data (its own reference, periods, objectives, key results, kpis) in the store.
 */
export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef, commit, dispatch }, item) => {
  if (!item) return unbindFirestoreRef('activeItem');

  // Bind the active item
  commit('SET_ACTIVE_ITEM_REF', item);
  await bindFirestoreRef('activeItem', item, { maxRefDepth: 1 });

  // Bind periods
  const periodsRef = db
    .collection('periods')
    .where('archived', '==', false)
    .where('parent', '==', item)
    .orderBy('startDate', 'desc');
  await bindFirestoreRef('periods', periodsRef, { maxRefDepth: 0 });

  // Bind active period
  const activePeriod = await getActivePeriod(periodsRef);
  await dispatch('set_active_period_and_data', activePeriod.id);

  // Bind KPIs
  const kpisRef = db.collection('kpis').where('parent', '==', item);
  await bindFirestoreRef('kpis', kpisRef, { maxRefDepth: 0 });

  return true;
});

/**
 * Gets the active period for an item. If there's no active period for the current date,
 * it returns the latest period for the item.
 */
async function getActivePeriod(periodsRef) {
  const filterPeriodsIncludeToday = doc => {
    const now = new Date();
    const { startDate, endDate } = doc.data();
    if (startDate.toDate() > now) return false;
    if (endDate.toDate() < now) return false;
    return true;
  };

  let activePeriodRef = await periodsRef
    .get()
    .then(snapshot => snapshot.docs.filter(filterPeriodsIncludeToday))
    .then(list => (list[0] && list[0].ref ? list[0].ref : null));

  if (!activePeriodRef) {
    activePeriodRef = await periodsRef.get().then(snapshot => snapshot.docs[0]);
  }

  return activePeriodRef;
}
