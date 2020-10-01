import { db } from '@/config/firebaseConfig';

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

export default getSlugRef;
