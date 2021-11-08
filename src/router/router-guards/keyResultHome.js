import store from '@/store';

export default async function keyResultHome(to, from, next) {
  const { keyResultId } = to.params;

  try {
    await store.dispatch('setPreviousUrl', from);
    await store.dispatch('set_active_key_result', keyResultId);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
