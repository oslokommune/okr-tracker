import store from '@/store';

export default async function objectiveHome(to, from, next) {
  const { objectiveId } = to.params;

  try {
    const { period } = await store.dispatch('set_active_objective', objectiveId);
    const { activePeriod } = store.state;

    if (!activePeriod || activePeriod.id !== period.id) {
      await store.dispatch('set_active_period_and_data', period.id);
    }
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
