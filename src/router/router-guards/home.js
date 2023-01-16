import store from '@/store';

export default async function routerGuardHome(to, from, next) {
  if (!store.state || !store.state.user) {
    next({
      name: 'Login',
      query: { redirectFrom: to.fullPath },
    });
  }

  try {
    await store.dispatch('set_active_item', null);
    next();
  } catch (error) {
    next(false);
  }
}
