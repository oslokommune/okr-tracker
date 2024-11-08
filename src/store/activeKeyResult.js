import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { useKeyResult } from '@/composables/keyResult';

export const useActiveKeyResultStore = defineStore('activeKeyResult', () => {
  const route = useRoute();

  const keyResultId = computed(() => route.params?.keyResultId);
  const keyResult = useKeyResult(keyResultId);

  return { keyResultId, ...keyResult };
});

export default useActiveKeyResultStore;
