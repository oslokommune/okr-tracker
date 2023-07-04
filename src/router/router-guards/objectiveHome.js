import store from '@/store';

export default async function objectiveHome(to, from, next) {
  const { objectiveId } = to.params;

  try {
    const activeObjective = await store.dispatch('set_active_objective', objectiveId);
    const { activeItem, activePeriod } = store.state;

    if (!activePeriod || activePeriod.id !== activeObjective?.period?.id) {
      await store.dispatch('set_active_period_and_data', {
        periodId: activeObjective?.period?.id,
        item: activeItem,
      });
    }
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
