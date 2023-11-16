import { useLocalStorage } from '@vueuse/core';
import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import { DEFAULT_KPI_PERIOD, getPeriods } from '@/config/periods';
import { PeriodSerializer } from '@/util/period';
import { isDepartment } from '@/util/getActiveItemType';

export default {
  namespaced: true,

  state: () => ({
    selectedPeriod: useLocalStorage('kpi-period', getPeriods()[DEFAULT_KPI_PERIOD], {
      serializer: PeriodSerializer,
    }),
    kpis: [],
    subKpis: [],
  }),

  mutations: {
    SET_SELECTED_PERIOD(state, payload) {
      state.selectedPeriod = payload;
    },
  },

  actions: {
    setSelectedPeriod: async ({ commit }, payload) => {
      commit('SET_SELECTED_PERIOD', payload);
      return true;
    },

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
