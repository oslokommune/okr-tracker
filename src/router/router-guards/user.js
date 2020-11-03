import { db } from '@/config/firebaseConfig';

export default async function RouterGuardUser(to, from, next) {
  const { id } = to.params;

  if (!id) {
    next();
  } else {
    try {
      const { exists } = await db.collection('users').doc(id).get();
      if (!exists) throw new Error();

      next();
    } catch {
      next({ name: 'Not found' });
    }
  }
}
