import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import { isDepartment } from '@/util/getActiveItemType';

export default {
  namespaced: true,

  state: () => ({
    kpis: [],
    subKpis: [],
  }),

  actions: {
    setKpis: firestoreAction(
      async ({ bindFirestoreRef, unbindFirestoreRef, dispatch, rootState }) => {
        const { activeItem, activeItemRef } = rootState;

        if (!activeItemRef || !activeItem) {
          dispatch('clearKpis');
          return;
        }

        unbindFirestoreRef('subKpis');

        // Bind KPIs
        const kpisRef = db
          .collection('kpis')
          .where('parent', '==', activeItemRef)
          .where('archived', '==', false);

        await bindFirestoreRef('kpis', kpisRef, { maxRefDepth: 1 });

        if (isDepartment(activeItem)) {
          // Bind any KPIs from child products
          const products = await db
            .collection('products')
            .where('archived', '==', false)
            .where('department', '==', activeItemRef)
            .limit(10)
            .get()
            .then((snapshot) => snapshot.docs.map((doc) => doc.ref));

          if (products.length) {
            const subKpisRef = db
              .collection('kpis')
              .where('archived', '==', false)
              .where('parent', 'in', products);

            await bindFirestoreRef('subKpis', subKpisRef, { maxRefDepth: 1 });
          }
        }
      }
    ),

    clearKpis: firestoreAction(({ unbindFirestoreRef }) => {
      unbindFirestoreRef('kpis');
      unbindFirestoreRef('subKpis');
    }),
  },
};
