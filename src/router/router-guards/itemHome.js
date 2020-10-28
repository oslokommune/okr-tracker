import store from '@/store';
import getSlugRef from './routerGuardUtil';

const { state } = store;

/**
 * Router guard for organization, department, and product 'home' pages.
 */
export default async function (to, from, next) {
  const { activeItem } = state;
  const { slug } = to.params;

  if (from.params && from.params.slug === slug) next();
  if (activeItem && activeItem.slug === slug) next();

  try {
    const slugRef = await getSlugRef(slug);

    if (!activeItem || !slugRef || activeItem.id !== slugRef.id) {
      await store.dispatch('set_active_item', slugRef);
      await store.dispatch('set_sidebar_items');
    }

    return next();
  } catch (error) {
    console.log(error);
    next({ name: 'Not found' });
  }
}
