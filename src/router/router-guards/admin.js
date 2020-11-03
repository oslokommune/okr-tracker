import store from '@/store';

export default async function admin(to, from, next) {
  if (store.state && store.state.user) {
    await store.dispatch('set_active_item', null);
    await store.dispatch('set_sidebar_items');
    next();
  } else {
    next(false);
  }
}
