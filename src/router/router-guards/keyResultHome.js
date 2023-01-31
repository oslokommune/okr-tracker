import store from '@/store';
import { documentIdFromRef } from '@/util/firebaseUtil';

export default async function keyResultHome(to, from, next) {
  const { keyResultId } = to.params;

  try {
    const { objective } = await store.dispatch('set_active_key_result', keyResultId);
    const objectivePeriodId = documentIdFromRef(objective.period);
    const { activePeriod } = store.state;

    if (!activePeriod || activePeriod.id !== objectivePeriodId) {
      await store.dispatch('set_active_period_and_data', objectivePeriodId);
    }
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
