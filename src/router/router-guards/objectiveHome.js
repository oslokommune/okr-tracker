import store from '@/store';

export default async function objectiveHome(to, from, next) {
  const { objectiveId } = to.params;

  try {
    await store.dispatch('set_active_objective', objectiveId);
    await store.dispatch('set_key_results', objectiveId);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
