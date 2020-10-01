import { db } from '@/config/firebaseConfig';
import store from '@/store';

/**
 * Router guard for admin pages for organizations, departments and products.
 *
 * Checks if the user is an admin or a member of the team before allowing access to the page.
 */
export default async function (to, from, next) {
  const { slug } = to.params;

  const slugSnapshot = await db.doc(`slugs/${slug}`).get();
  if (!slugSnapshot.exists) {
    console.error(`cannot find ${slug}`);
    next('/404');
    return;
  }

  const { reference } = slugSnapshot.data();
  const teamIds = await reference
    .get()
    .then(snapshot => snapshot.data().team)
    .then(team => (team ? team.map(({ id }) => id) : []));
  const { admin, email } = store.state.user && store.state.user;
  const user = db.collection('users').doc(email);
  const isMemberOfTeam = teamIds.includes(user.id);

  if (!admin && !isMemberOfTeam) {
    next(`/${slug}`);
  }

  try {
    await store.dispatch('set_active_item', reference);
    await store.dispatch('set_sidebar_items');
    return next();
  } catch (error) {
    console.log(error);
    next(false);
  }
}
