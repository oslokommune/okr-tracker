import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useCollection } from 'vuefire';
import { useRoute } from 'vue-router';
import { collection, query, where } from 'firebase/firestore';
import { useLocalStorage } from '@vueuse/core';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { db } from '@/config/firebaseConfig';
import { DEFAULT_OKR_PERIOD, getPeriods } from '@/config/periods';
import { PeriodSerializer } from '@/util/period';
import { useActiveItemStore } from '@/store/activeItem';

export const useOkrsStore = defineStore('okrs', () => {
  const route = useRoute();
  const itemStore = useActiveItemStore();

  // Period
  const period = useLocalStorage('okr-period', getPeriods()[DEFAULT_OKR_PERIOD], {
    serializer: PeriodSerializer,
  });

  // Objectives
  const { objective: activeObjective } = storeToRefs(useActiveObjectiveStore());

  const isOkrsView = computed(() =>
    ['ItemHome', 'ObjectiveHome', 'KeyResultHome'].includes(route.name)
  );

  const { data: _objectives, pending: _objectivesIsLoading } = useCollection(
    computed(
      () =>
        isOkrsView.value &&
        itemStore.itemRef &&
        query(
          collection(db, 'objectives'),
          where('parent', '==', itemStore.itemRef),
          where('archived', '==', false)
        )
    ),
    { maxRefDepth: 1, ssrKey: 'objectives' }
  );

  const { data: _objectiveContributions, pending: _objectiveContributionsIsLoading } =
    useCollection(
      computed(
        () =>
          isOkrsView.value &&
          itemStore.itemRef &&
          query(
            collection(db, 'objectiveContributors'),
            where('item', '==', itemStore.itemRef)
          )
      ),
      { maxRefDepth: 1, ssrKey: 'objectiveContributions' }
    );

  const isLoading = computed(
    () => _objectivesIsLoading.value || _objectiveContributionsIsLoading.value
  );

  const objectives = computed(() => {
    const allObjectives = [
      // Objectives where the currently active item is parent
      ..._objectives.value,
      // Also include external objectives
      ..._objectiveContributions.value
        .filter((oc) => {
          return (
            // Filter out archived objectives ...
            !oc.objective.archived &&
            // ... and those that aren't external.
            !_objectives.value.map((o) => o.id).includes(oc.objective.id)
          );
        })
        .map((oc) => oc.objective),
    ];

    // Include any active objective - either lifted or archived - as ghost until dismissed
    if (
      activeObjective.value &&
      !allObjectives.find((o) => o.id === activeObjective.value.id)
    ) {
      allObjectives.push(activeObjective.value);
    }

    return allObjectives;
  });

  // Workbench
  const _workbenchObjectivesIds = ref([]);
  const workbenchObjectives = computed(() =>
    objectives.value
      .filter((o) => _workbenchObjectivesIds.value.includes(o.id))
      .sort(
        (a, b) =>
          (a.startDate || a.period.startDate) - (b.startDate || b.period.startDate)
      )
  );

  function addWorkbenchObjective(objectiveId) {
    if (!_workbenchObjectivesIds.value.includes(objectiveId)) {
      _workbenchObjectivesIds.value.push(objectiveId);
    }
  }

  function removeWorkbenchObjective(objectiveId) {
    _workbenchObjectivesIds.value = _workbenchObjectivesIds.value.filter(
      (oid) => oid !== objectiveId
    );
  }

  function clearWorkbenchObjectives() {
    _workbenchObjectivesIds.value = [];
  }

  return {
    period,
    objectives,
    isLoading,
    workbenchObjectives,
    addWorkbenchObjective,
    removeWorkbenchObjective,
    clearWorkbenchObjectives,
  };
});

export default useOkrsStore;
