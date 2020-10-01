import store from '@/store';

export default async function (to, from, next) {
  if (store.state && store.state.user && store.state.user.admin) {
    await store.dispatch('set_active_item', null);
    await store.dispatch('set_sidebar_items');
    next();
  } else {
    next(false);
  }
}
