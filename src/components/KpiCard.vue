<template>
  <div class="kpi-card">
    <div class="kpi-card__name">{{ kpi.name }}</div>
    <div class="kpi-card__value">
      <span v-if="kpi.error || !kpi.valid">–––</span>
      <span v-else>{{ formatKPIValue(kpi) }}</span>
    </div>
  </div>
</template>

<script>
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'KpiCard',

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
.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
  overflow: hidden;
  color: var(--color-text);
  font-weight: 500;
  background: var(--color-secondary-light);

  &__value {
    font-weight: 900;
    font-size: 1.5rem;
    line-height: 1em;
  }

  @media screen and (min-width: bp(m)) {
    gap: 1rem;

    &__value {
      font-size: 2rem;
    }
  }
}
</style>
