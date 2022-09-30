<template>
  <div :class="{ kpi: true }">
    <div class="kpi__name">{{ kpi.name }}</div>
    <div class="kpi__value">
      <span v-if="kpi.error || !kpi.valid">–––</span>
      <span v-else>{{ formatKPIValue(kpi) }}</span>
    </div>
  </div>
</template>

<script>
import { numberLocale } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'KPI',

  props: {
    kpi: {
      type: Object,
      required: true,
      default: null,
    },
  },

  methods: {
    formatKPIValue,
  },
};
</script>

<style lang="scss" scoped>
.kpi {
  position: relative;
  height: 8rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  color: var(--color-text);
  font-weight: 500;
  background: var(--color-secondary-light);

  &__value {
    font-weight: 900;
    font-size: 3rem;
    line-height: 1em;
  }
}
</style>
