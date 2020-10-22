import store from '@/store';

export default async function (to, from, next) {
  const { kpiId } = to.params;

  try {
    await store.dispatch('set_active_kpi', kpiId);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
