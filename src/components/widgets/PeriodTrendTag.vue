<template>
  <span v-if="kpi" :class="bgColor" class="period-trend-tag">
    {{ periodTrendFormatted }}
  </span>
</template>

<script>
import { mapState } from 'vuex';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'PeriodTrendTag',

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    progress: {
      type: Array,
      required: true,
    },
    latestProgressRecord: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['selectedPeriod']),

    periodTrend() {
      const firstProgressRecord = this.progress[0]?.value;
      const latestProgressRecord = this.latestProgressRecord?.value;
      const diff = latestProgressRecord - firstProgressRecord;
      return Math.round(diff * 100) / 100;
    },
    periodTrendFormatted() {
      const prefix = this.periodTrend > 0 ? '+' : '';
      const formattedTrend = formatKPIValue(this.kpi, this.periodTrend);

      return `${prefix + formattedTrend}`;
    },
    bgColor() {
      const ri = this.kpi;
      const preferredTrendIsSet = ri?.preferredTrend !== undefined;
      const preferredTrendFulfilled =
        (ri?.preferredTrend === 'increase' && this.periodTrend > 0) ||
        (ri?.preferredTrend === 'decrease' && this.periodTrend < 0);

      return {
        neutral: !preferredTrendIsSet || this.periodTrend === 0,
        positive: preferredTrendIsSet && preferredTrendFulfilled,
        negative:
          preferredTrendIsSet && this.periodTrend !== 0 && !preferredTrendFulfilled,
      };
    },
  },

  methods: {
    formatKPIValue,
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.period-trend-tag {
  padding: 0.25rem;
  font-weight: 500;
  font-size: typography.$font-size-0;
}

.neutral {
  color: var(--color-blue-dark);
  background: var(--color-blue-light);
}

.positive {
  color: var(--color-success);
  background: var(--color-green-light);
}

.negative {
  color: #770d01; // TODO: når implementert i Punkt: var(--color-red-80);
  background: #f9b3ab; // TODO: når implementert i Punkt: var(--color-red-30);
}
</style>
