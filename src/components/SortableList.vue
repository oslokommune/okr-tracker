<script setup>
import { ref } from 'vue';
import { useSortable } from '@vueuse/integrations/useSortable';

const props = defineProps({
  handle: {
    type: String,
    required: false,
    default: null,
  },
  animation: {
    type: Number,
    required: false,
    default: 300,
  },
});

const items = defineModel({
  type: Array,
  required: false,
  default: () => [],
});

const list = ref(null);

useSortable(list, items, props);
</script>

<template>
  <div ref="list">
    <slot />
  </div>
</template>
