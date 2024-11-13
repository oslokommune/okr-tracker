<script setup>
import { computed } from 'vue';
import { contributorTagColor } from '@/util/okr';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const bulletStyle = computed(() => ({
  background: props.item?.color || contributorTagColor(props.item.name),
}));
</script>

<template>
  <span class="item-tag">
    <span class="item-tag__bullet" :style="bulletStyle"></span>
    <span>{{ item.name }}</span>
  </span>
</template>

<style lang="scss" scoped>
.item-tag {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  white-space: nowrap;

  &__bullet {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }
}
</style>
