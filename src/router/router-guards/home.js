import store from '@/store';

export default async function routerGuardHome(to, from, next) {
  if (!store.state || !store.state.user) {
    next('/login');
  }

  try {
    // await store.dispatch('set_active_item', null);
    await store.dispatch('set_sidebar_items');
    next();
  } catch (error) {
    next(false);
  }
}
