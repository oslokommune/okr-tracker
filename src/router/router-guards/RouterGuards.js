import { db } from '@/config/firebaseConfig';
import store from '@/store';

/**
 * Router guard for organization, department, and product 'home' pages.
 *
 * Finds and verifies the document from slug and waits for 'set_active_item' action in store
 * to resolve before allowing the route to change.
 */
async function itemHome(to, from, next) {
  const { slug } = to.params;

  const slugSnapshot = await db.doc(`slugs/${slug}`).get();
  if (!slugSnapshot.exists) {
    console.error(`cannot find ${slug}`);
    next('/404');
    return;
  }

  const { reference } = slugSnapshot.data();

  try {
    await store.dispatch('set_active_item', reference);
    await store.dispatch('set_sidebar_items');
    return next();
  } catch (error) {
    console.log(error);
    next(false);
  }
}

async function keyResultHome(to, from, next) {
  const { keyResultId } = to.params;

  try {
    await store.dispatch('set_active_key_result', keyResultId);
    return next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}

async function home(to, from, next) {
  try {
    await store.dispatch('set_active_item', null);
    await store.dispatch('set_sidebar_items');
    return next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}

export { home, itemHome, keyResultHome };
