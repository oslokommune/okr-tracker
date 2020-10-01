import store from '@/store';
import getSlugRef from './routerGuardUtil';

/**
 * Router guard for organization, department, and product 'home' pages.
 *
 * Finds and verifies the document from slug and waits for 'set_active_item' action in store
 * to resolve before allowing the route to change.
 */
export default async function (to, from, next) {
  const { slug } = to.params;

  const slugRef = await getSlugRef(slug, next);

  try {
    await store.dispatch('set_active_item', slugRef);
    await store.dispatch('set_sidebar_items');
    return next();
  } catch (error) {
    console.log(error);
    next(false);
  }
}
