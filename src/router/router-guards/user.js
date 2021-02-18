import { db } from '@/config/firebaseConfig';
import store from '@/store';

const { state } = store;

export default async function RouterGuardUser(to, from, next) {
  const { id } = to.params;

  if (!id) {
    next();
  } else {
    try {
      const { exists } = await db.collection('users').doc(id).get();
      if (!exists) throw new Error();

      next();
    } catch (e) {
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
}
