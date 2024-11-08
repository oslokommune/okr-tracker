import { computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';
import { globalFirestoreOptions, useCollection, useDocument } from 'vuefire';
import { doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { uniqueBy } from '@/util';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';

export function useObjective(objectiveId) {
  const { item, isProduct, isDepartment, isOrganization } = storeToRefs(
    useActiveItemStore()
  );
  const { hasEditRights } = storeToRefs(useAuthStore());

  // Objective
  const _objectiveId = toRef(objectiveId);
  const objectiveRef = computed({
    get() {
      return (
        _objectiveId.value &&
        item.value &&
        doc(db, 'objectives', _objectiveId.value).withConverter({
          fromFirestore: (snapshot, options) => {
            const objective = globalFirestoreOptions.converter.fromFirestore(
              snapshot,
              options
            );

            // Ensure that the objective is owned by `item` or direct ancestor
            if (objective.parent.path !== item.value.path) {
              // The objective must be owned by the product parent department
              if (
                isProduct.value &&
                objective.parent.path !== item.value.department.path
              ) {
                return null;
              }
              // The objective must be owned by the department parent organization
              if (
                isDepartment.value &&
                objective.parent.path !== item.value.organization.path
              ) {
                return null;
              }
              // The objective must be owned by the organization itself
              if (isOrganization.value) {
                return null;
              }
            }

            return objective.archived && !hasEditRights.value ? null : objective;
          },
        })
      );
    },
    set(ref) {
      _objectiveId.value = ref.id;
    },
  });

  const {
    data: objective,
    pending: isLoading,
    promise: objectivePromise,
  } = useDocument(objectiveRef, {
    maxRefDepth: 1,
    ssrKey: `objective_${objectiveId}`,
  });

  const objectiveOwner = computed(() => objective.value && objective.value.parent);
  const objectivePeriod = computed(() => {
    const { startDate, endDate, period } = objective.value;
    if (startDate && endDate) {
      return { startDate: startDate.toDate(), endDate: endDate.toDate() };
    }
    if (period) {
      return { startDate: period.startDate.toDate(), endDate: period.endDate.toDate() };
    }
    return null;
  });

  // Key results
  const { data: keyResults, pending: keyResultsIsLoading } = useCollection(
    computed(
      () =>
        objectiveRef.value &&
        query(
          collection(db, 'keyResults'),
          where('objective', '==', objectiveRef.value),
          where('archived', '==', false)
        )
    ),
    { ssrKey: `keyResults_${objectiveId}` }
  );

  /**
   * Return a list of unique contributors to the key results in `keyResults`.
   */
  const contributors = computed(() =>
    uniqueBy(
      keyResults.value.map((kr) => kr.parent).filter((parent) => parent.name),
      'id'
    )
  );

  /**
   * Return a list of contributors that does not include the current item.
   */
  const externalContributors = computed(() => {
    return contributors.value.filter(({ id }) => id !== item.value.id);
  });

  /**
   * Return `true` if the current objective has another parent than `item`.
   */
  const isInheritedObjective = computed(() => {
    return objectiveOwner.value && objectiveOwner.value.id !== item.value.id;
  });

  /**
   * Return true if `item` has own key result attached to this objective.
   */
  const hasOwnKeyResult = computed(() =>
    contributors.value.map((c) => c.id).includes(item.value.id)
  );

  return {
    objective,
    objectiveRef,
    objectiveOwner,
    objectivePeriod,
    isLoading,
    objectivePromise,
    keyResults,
    keyResultsIsLoading,
    contributors,
    externalContributors,
    isInheritedObjective,
    hasOwnKeyResult,
  };
}

export default useObjective;
