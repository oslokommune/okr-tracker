import { db } from '@/config/firebaseConfig';

const getSlugRef = async slug => {
  const slugSnapshot = await db.doc(`slugs/${slug}`).get();
  if (!slugSnapshot.exists) {
    console.error(`cannot find ${slug}`);
    throw new Error(`cannot find ${slug}`);
  }

  const { reference } = slugSnapshot.data();

  return reference;
};

export default getSlugRef;
