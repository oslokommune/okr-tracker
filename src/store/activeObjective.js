import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { useObjective } from '@/composables/objective';

export const useActiveObjectiveStore = defineStore('activeObjective', () => {
  const route = useRoute();

  const objectiveId = computed(() => route.params?.objectiveId);
  const objective = useObjective(objectiveId);

  return { objectiveId, ...objective };
});

export default useActiveObjectiveStore;
