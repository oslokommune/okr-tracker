import store from '@/store';
import getSlugRef from './routerGuardUtil';

const { state } = store;

/**
 * Common router guard for "item" (organization, department, and product) pages
 * and their sub-pages.
 */
export default async function itemCommon(to, from, next) {
  const { activeItem } = state;
  const { slug } = to.params;

  try {
    const slugRef = await getSlugRef(slug);

    if (!activeItem || !slugRef || activeItem.id !== slugRef.id) {
      await store.dispatch('set_active_item', slugRef);
    }

    next();
  } catch ({ message }) {
    if (!state.user) {
      next({
        name: 'Login',
        query: { redirectFrom: to.fullPath },
      });
    } else {
      next({ name: 'Not found' });
    }
  }
}
