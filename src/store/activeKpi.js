import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { useKpi } from '@/composables/kpi';

export const useActiveKpiStore = defineStore('activeKpi', () => {
  const route = useRoute();

  const kpiId = computed(() => route.params?.kpiId);
  const kpi = useKpi(kpiId);

  return { kpiId, ...kpi };
});

export default useActiveKpiStore;
