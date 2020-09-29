import store from '@/store';

export default async function (to, from, next) {
  const { keyResultId } = to.params;

  try {
    await store.dispatch('set_active_key_result', keyResultId);
    return next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
