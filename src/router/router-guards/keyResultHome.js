import store from '@/store';
import getSlugRef from './routerGuardUtil';

export default async function (to, from, next) {
  const { slug, keyResultId } = to.params;

  const slugRef = await getSlugRef(slug, next);

  try {
    await store.dispatch('set_active_item', slugRef);
    await store.dispatch('set_sidebar_items');
    await store.dispatch('set_active_key_result', keyResultId);
    return next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
