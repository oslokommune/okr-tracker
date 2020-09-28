import { db } from '@/config/firebaseConfig';
import store from '@/store';

const getSlugRef = async (slug, next) => {
  const slugSnapshot = await db.doc(`slugs/${slug}`).get();
  if (!slugSnapshot.exists) {
    console.error(`cannot find ${slug}`);
    next('/404');
    return;
  }

  const { reference } = slugSnapshot.data();

  return reference;
};

/**
 * Router guard for organization, department, and product 'home' pages.
 *
 * Finds and verifies the document from slug and waits for 'set_active_item' action in store
 * to resolve before allowing the route to change.
 */
async function itemHome(to, from, next) {
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

async function keyResultHome(to, from, next) {
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
