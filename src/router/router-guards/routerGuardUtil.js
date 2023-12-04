import { db } from '@/config/firebaseConfig';
import { firestoreEncode } from '@/util/firebaseUtil';
import isAdmin from '@/util/user';
import store from '@/store';

const getSlugRef = async (slug) => {
  const slugSnapshot = await db.doc(`slugs/${firestoreEncode(slug)}`).get();

  if (!slugSnapshot.exists) {
    return null;
  }
  const { reference } = slugSnapshot.data();

  const refData = await reference
    .get()
    .then((snap) => snap.data())
    .catch(() => null);

  return !refData || (refData.archived && !isAdmin(store.state.user)) ? null : reference;
};

export default getSlugRef;
