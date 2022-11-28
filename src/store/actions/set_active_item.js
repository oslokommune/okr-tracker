import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import getActivePeriod from './actionUtils';

/**
 * When navigating to an organization, department or product, the 'item' is stored along with its
 * related data (its own reference, periods, objectives, key results, kpis) in the store.
 */
export default firestoreAction(
  async ({ bindFirestoreRef, unbindFirestoreRef, commit, dispatch }, item) => {
    if (!item) {
      return unbindFirestoreRef('activeItem');
    }

    // Bind the active item
    commit('SET_ACTIVE_ITEM_REF', item);
    await bindFirestoreRef('activeItem', item, { maxRefDepth: 1 });

    const { activePeriodRef, periodsRef } = await getActivePeriod(item);

    // Bind periods
    await bindFirestoreRef('periods', periodsRef, { maxRefDepth: 0 });

    // Bind active period
    await dispatch(
      'set_active_period_and_data',
      activePeriodRef ? activePeriodRef.id : null
    );

    // Bind KPIs
    const kpisRef = db
      .collection('kpis')
      .where('parent', '==', item)
      .where('archived', '==', false);
    await bindFirestoreRef('kpis', kpisRef, { maxRefDepth: 0 });

    return true;
  }
);
