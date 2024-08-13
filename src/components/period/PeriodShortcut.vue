<template>
  <pkt-button
    :class="['period-shortcut', { 'period-shortcut--active': active }]"
    skin="secondary"
    @onClick="$emit('click', $event)"
  >
    <div class="pkt-txt-14-medium">{{ label }}</div>
    <div v-if="formattedPeriod" class="pkt-txt-14-light">
      {{ formattedPeriod }}
    </div>
  </pkt-button>
</template>

<script>
import { formattedPeriod } from '@/util/okr';
import { PktButton } from '@oslokommune/punkt-vue';

export default {
  name: 'PeriodShortcut',

  components: {
    PktButton,
  },

  props: {
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
  },

  computed: {
    formattedPeriod() {
      const { startDate, endDate } = this;
      return formattedPeriod({ startDate, endDate });
    },
  },
};
</script>

<style lang="scss" scoped>
.period-shortcut {
  --pkt-color-button-background-normal: var(--color-gray);
  --pkt-color-button-border-normal: var(--color-gray);

  height: auto;
  padding: 0.5rem 1rem;
  white-space: nowrap;

  &--active {
    --pkt-color-button-background-normal: var(--color-blue-light);
    --pkt-color-button-border-normal: var(--color-blue-light);
  }
}
</style>
