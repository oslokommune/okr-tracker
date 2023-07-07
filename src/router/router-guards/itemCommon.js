import store from '@/store';
import getSlugRef from './routerGuardUtil';

const { state } = store;

/**
 * Common router guard for "item" (organization, department, and product) pages
 * and their sub-pages.
 */
export default async function itemCommon(to, from, next) {
  if (!state.user) {
    return next({
      name: 'Login',
      query: { redirectFrom: to.fullPath },
    });
  }

  const { activeItem } = state;
  const { slug } = to.params;
  const slugRef = await getSlugRef(slug);

  if (!activeItem || !slugRef || activeItem.id !== slugRef.id) {
    await store.dispatch('set_active_item', slugRef);
  }

  return next();
}
