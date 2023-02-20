import { db } from '@/config/firebaseConfig';
import store from '@/store';

const getSlugRef = async (slug) => {
  const slugSnapshot = await db.doc(`slugs/${slug}`).get();

  if (!slugSnapshot.exists) {
    throw new Error(`cannot find ${slug}`);
  }
  const { reference } = slugSnapshot.data();

  const { archived } = await reference.get().then((snap) => snap.data());

  if (archived && (!store.state.user.admin || !store.state.user.superAdmin)) {
    throw new Error(`cannot find ${slug}`);
  }

  return reference;
};

export default getSlugRef;
