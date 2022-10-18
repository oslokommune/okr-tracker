import store from '@/store';

const { state } = store;

export default async function dashboard(to, from, next) {
  const { activeItem } = state;

  try {
    await store.dispatch('set_sub_kpis', activeItem.id);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
