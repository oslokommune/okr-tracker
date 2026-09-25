<script setup>
import { computed } from 'vue';
import { formattedPeriod } from '@/util/okr';
import '@oslokommune/punkt-elements/dist/pkt-button.js';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  startDate: {
    type: [Date, Boolean],
    required: false,
    default: null,
  },
  endDate: {
    type: [Date, Boolean],
    required: false,
    default: null,
  },
  active: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const period = computed(() => {
  const { startDate, endDate } = props;
  return formattedPeriod({ startDate, endDate });
});
</script>

<template>
  <pkt-button
    :class="['period-shortcut', { 'period-shortcut--active': active }]"
    skin="secondary"
  >
    <span>
      <div class="pkt-txt-14-medium">{{ label }}</div>
      <div v-if="period" class="pkt-txt-14-light">
        {{ period }}
      </div>
    </span>
  </pkt-button>
</template>

<style lang="scss" scoped>
.period-shortcut {
  --pkt-color-button-background-normal: var(--color-gray);
  --pkt-color-button-border-normal: var(--color-gray);

  :deep(.pkt-btn) {
    height: auto;
    padding: 0.5rem 1rem;
    white-space: nowrap;
  }

  &--active {
    --pkt-color-button-background-normal: var(--color-blue-light);
    --pkt-color-button-border-normal: var(--color-blue-light);
  }
}
</style>
