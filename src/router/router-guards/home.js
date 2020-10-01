import store from '@/store';

export default async function (to, from, next) {
  if (!store.state.user) {
    next('/login');
    return;
  }

  try {
    await store.dispatch('set_active_item', null);
    await store.dispatch('set_sidebar_items');
    return next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
