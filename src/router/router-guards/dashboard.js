import store from '@/store';
import getActivePeriod from '@/store/actions/actionUtils';

const { state } = store;

/**
 * Router guard for organization, department, and product 'dashboard' pages.
 * Ensures that the current period is set.
 */
export default async function dashboard(to, from, next) {
  const now = new Date().getTime() / 1000;

  try {
    const {
      activePeriod: { startDate, endDate },
    } = state;

    if (startDate.seconds > now || endDate.seconds < now) {
      const { activePeriodRef } = await getActivePeriod(state.activeItemRef);
      await store.dispatch('set_active_period_and_data', activePeriodRef.id);
    }

    next();
  } catch {
    throw new Error('No period found');
  }
}
