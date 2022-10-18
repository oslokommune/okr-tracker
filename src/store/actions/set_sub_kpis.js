import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, departmentId) => {
  if (!departmentId) {
    return unbindFirestoreRef('subKpis');
  }

  const department = db.doc(`departments/${departmentId}`);
  const departmentExists = await department.get().then(ss => ss.exists);

  if (!departmentExists) {
    return unbindFirestoreRef('subKpis');
  }

  const products = await db
        .collection('products')
        .where('department', '==', department)
        .limit(10)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.ref));

  if (products.length) {
    const subKpisRef = db
          .collection('kpis')
          .where('parent', 'in', products);

    await bindFirestoreRef('subKpis', subKpisRef, { maxRefDepth: 0 });
  }

  return true;
});
