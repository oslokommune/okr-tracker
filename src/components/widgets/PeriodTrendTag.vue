<template>
  <div>
    <div v-if="progressCollection.length > 0">
      <span class="trendTag__value">
        {{ formatKPIValue(kpi, latestProgressRecord.value) }}
        <span v-if="kpi" :class="bgColor" class="trendTag__trend">
          {{ periodTrendFormatted }}
        </span>
      </span>
      <mini-graph v-if="displayGraph" :kpi-data="progressCollection" />
    </div>
    <span v-else class="trendTag__noData">{{ $t('kpi.noData') }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { formatKPIValue, getKPIProgress, getKPIProgressQuery } from '@/util/kpiHelpers';

export default {
  name: 'PeriodTrendTag',

  components: {
    MiniGraph: () => import('@/util/LineChart/MiniGraph.vue'),
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    displayGraph: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    progressCollection: [],
  }),

  computed: {
    ...mapState(['selectedPeriod']),
    latestProgressRecord() {
      if (this.progressCollection.length) {
        return this.progressCollection.slice(-1)[0];
      }
      return 0;
    },
    periodTrend() {
      const firstProgressRecord = this.progressCollection[0]?.value;
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

  watch: {
    selectedPeriod: {
      immediate: true,
      handler: 'setProgress',
    },
  },

  methods: {
    formatKPIValue,

    async setProgress() {
      const { startDate, endDate } = this.selectedPeriod;
      this.progressCollection = getKPIProgress(startDate, endDate, this.kpi);

      if (!this.progressCollection || this.progressCollection.length === 0) {
        const query = getKPIProgressQuery(startDate, endDate, this.kpi);
        await this.$bind('progressCollection', query.orderBy('timestamp', 'asc'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';
.trendTag {
  &__noData {
    color: var(--color-grayscale-40);
    font-weight: 400;
    font-size: typography.$font-size-1;
  }
  &__value {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-blue-dark);
    font-weight: 500;
    font-size: typography.$font-size-4;
  }
  &__trend {
    padding: 0.25rem;
    font-weight: 500;
    font-size: typography.$font-size-0;
  }
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
