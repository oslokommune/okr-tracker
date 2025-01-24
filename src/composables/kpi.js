import { computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';
import { firestoreDefaultConverter, useCollection, useDocument } from 'vuefire';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import {
  filterDuplicatedProgressValues,
  getCachedKPIProgress,
  getKPIProgressConstraints,
} from '@/util/kpiHelpers';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useKpisStore } from '@/store/kpis';

export function useKpi(kpiId) {
  const { item } = storeToRefs(useActiveItemStore());
  const { hasEditRights } = storeToRefs(useAuthStore());
  const { period } = storeToRefs(useKpisStore());

  // KPI
  const _kpiId = toRef(kpiId);
  const kpiRef = computed({
    get() {
      return (
        _kpiId.value &&
        item.value &&
        doc(db, 'kpis', _kpiId.value).withConverter({
          fromFirestore: (snapshot) => {
            const data = firestoreDefaultConverter.fromFirestore(snapshot);
            return data.archived && !hasEditRights.value ? null : data;
          },
        })
      );
    },
    set(ref) {
      _kpiId.value = ref.id;
    },
  });

  const { data: kpi, pending: kpiIsLoading, promise: kpiPromise } = useDocument(kpiRef);
  const isLoading = computed(() => kpiIsLoading.value || progressIsLoading.value);

  // Progress
  const _cachedProgress = computed(() => {
    return (
      (kpi.value &&
        getCachedKPIProgress(kpi.value, period.value.startDate, period.value.endDate)) ||
      []
    );
  });

  const _hasCachedProgress = computed(() => _cachedProgress.value.length);

  /**
   * Fetch progress from the KPI `progress` subcollection if no cached
   * progress is available.
   */
  const _progressSource = computed(() => {
    const { startDate, endDate } = period.value;

    return query(
      collection(db, kpiRef.value.path, 'progress'),
      ...getKPIProgressConstraints(startDate, endDate),
      orderBy('timestamp', 'desc')
    );
  });

  const { data: _progress, pending: progressIsLoading } = useCollection(
    computed(() => kpi.value && !_hasCachedProgress.value && _progressSource.value),
    { ssrKey: `progress_${kpiId}` }
  );

  /**
   * Return cached (if available) or actual progress values.
   */
  const progress = computed(() =>
    filterDuplicatedProgressValues(
      _cachedProgress.value.length ? _cachedProgress.value : _progress.value
    )
  );

  // Goals
  const goals = useCollection(
    computed(
      () =>
        kpiRef.value &&
        query(
          collection(db, kpiRef.value.path, 'goals'),
          where('archived', '==', false),
          orderBy('toDate', 'desc')
        )
    ),
    { ssrKey: `goals_${kpiId}` }
  );

  return {
    kpi,
    kpiRef,
    isLoading,
    kpiPromise,
    progress,
    goals,
    period,
  };
}

export default useKpi;
