import { db } from '@/config/firebaseConfig';

export default async function keyResultHome(to, from, next) {
  const { objectiveId, keyResultId } = to.params;

  if (!objectiveId) {
    // Look up objective id from key result if redirected legacy
    // key result paths.
    try {
      const keyRes = await db.collection('keyResults').doc(keyResultId).get();
      next({
        name: 'KeyResultHome',
        params: {
          ...to.params,
          objectiveId: keyRes.data().objective.id,
        },
      });
    } catch {
      next({ name: 'ItemHome', params: to.params });
    }
  } else {
    next();
  }
}
