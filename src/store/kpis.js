import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { useRoute } from 'vue-router';
import { collection, doc, query, where } from 'firebase/firestore';
import { useLocalStorage } from '@vueuse/core';
import { db } from '@/config/firebaseConfig';
import { DEFAULT_KPI_PERIOD, getPeriods } from '@/config/periods';
import { PeriodSerializer } from '@/util/period';
import { useActiveItemStore } from '@/store/activeItem';

export const useKpisStore = defineStore('kpis', () => {
  const route = useRoute();
  const itemStore = useActiveItemStore();

  // Period
  const period = useLocalStorage('kpi-period', getPeriods()[DEFAULT_KPI_PERIOD], {
    serializer: PeriodSerializer,
  });

  // Item KPIs
  const isKpisView = computed(() => route.name === 'ItemMeasurements');

  const { data: _kpis, pending: kpisIsLoading } = useCollection(
    computed(
      () =>
        isKpisView.value &&
        itemStore.itemRef &&
        query(
          collection(db, 'kpis'),
          where('parent', '==', itemStore.itemRef),
          where('archived', '==', false)
        )
    ),
    { ssrKey: 'kpis' }
  );

  const _includeSubKpis = computed(
    () => itemStore.isDepartment && itemStore.children.length > 0
  );

  const { data: _subKpis, pending: subKpisIsLoading } = useCollection(
    // For departments, also bind KPIs from child products
    computed(
      () =>
        isKpisView.value &&
        _includeSubKpis.value &&
        query(
          collection(db, 'kpis'),
          where(
            'parent',
            'in',
            itemStore.children.map((product) => doc(db, 'products', product.id))
          ),
          where('archived', '==', false)
        )
    ),
    { ssrKey: 'subKpis' }
  );

  const isLoading = computed(() => kpisIsLoading.value || subKpisIsLoading.value);
  const kpis = computed(() => [..._kpis.value, ..._subKpis.value]);

  return { period, kpis, isLoading, tmp: _subKpis };
});

export default useKpisStore;
