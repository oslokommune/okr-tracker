<template>
  <pkt-button
    :class="['period-shortcut', { 'pkt-btn--active': active }]"
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
import { PktButton } from '@oslokommune/punkt-vue2';

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
  --btn-link-bc: var(--color-gray);
  --btn-link-bg: var(--color-gray);
  --btn-focus-bg: var(--color-gray);
  --btn-active-bg: var(--color-blue-light);
  --btn-active-bc: var(--color-blue-light);
  --btn-active-txt: var(--color-blue-dark);

  height: auto;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}
</style>
