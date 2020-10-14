import store from '@/store';

export default async function (to, from, next) {
  const { objectiveId } = to.params;

  try {
    await store.dispatch('set_active_objective', objectiveId);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
