<template>
  <widget
    size="small"
    :title="kpi.name"
    :class="['kpi-card-widget', { 'kpi-card-widget--compact': compact }]"
  >
    <template v-if="hasEditRights" #title-actions>
      <pkt-icon class="drag-icon" name="drag" />
    </template>

    <div class="kpi-card-widget__inner">
      <div class="kpi-card-widget__trend">
        <period-trend-tag
          v-if="progress.length"
          :kpi="kpi"
          :progress="progress"
          :compact="compact"
        />
        <span v-else-if="!isProgressLoading" class="no-data pkt-txt-14">
          {{ $t(`kpi.${progressIsFiltered ? 'noDataFiltered' : 'noData'}`) }}
        </span>
      </div>

      <div
        :class="[
          'kpi-card-widget__graph',
          { 'kpi-card-widget__graph--compact': compact },
        ]"
      >
        <line-chart
          v-if="progress.length > 1"
          :series="chartSeries"
          v-bind="chartOptions"
          sparkline
        />
        <span v-else-if="progress.length === 1" class="no-data pkt-txt-12">{{
          $t('kpi.noGraph')
        }}</span>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import {
  filterDuplicatedProgressValues,
  formatKPIValue,
  getCachedKPIProgress,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import { getComputedStyleVariable, DEFAULT_SERIES_OPTIONS } from '@/util/chart';
import LineChart from '@/components/generic/LineChart.vue';
import PeriodTrendTag from '@/components/widgets/PeriodTrendTag.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

export default {
  name: 'WidgetKpiCard',

  components: {
    Widget: WidgetWrapper,
    PeriodTrendTag,
    LineChart,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    progressCollection: [],
    isProgressLoading: false,
  }),

  computed: {
    ...mapState(['activeItemRef']),
    ...mapState('kpis', ['selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    progress() {
      return filterDuplicatedProgressValues(this.progressCollection);
    },

    progressIsFiltered() {
      return this.selectedPeriod?.key !== 'all';
    },

    latestProgressRecord() {
      return this.progress.length ? this.progress[0] : null;
    },

    chartSeries() {
      return [
        {
          ...DEFAULT_SERIES_OPTIONS,
          name: this.$t('kpi.progress'),
          data: this.progress.map((r) => [
            r.timestamp.toDate().toISOString(),
            r.value,
            r.comment,
          ]),
          color: getComputedStyleVariable('--color-blue-light'),
          showSymbol: false,
          areaStyle: { opacity: 0.25 },
          lineStyle: { width: 2 },
        },
      ];
    },

    chartOptions() {
      return {
        yMin: this.kpi.startValue === 'min' ? null : 0,
        valueFormatter: (val) => formatKPIValue(this.kpi, val),
      };
    },
  },

  watch: {
    'kpi.progress': {
      immediate: true,
      handler: 'setProgress',
    },
    selectedPeriod: {
      immediate: false,
      handler: 'setProgress',
    },
  },

  methods: {
    formatKPIValue,

    async setProgress() {
      this.isProgressLoading = true;

      const { startDate, endDate } = this.selectedPeriod;
      this.progressCollection = getCachedKPIProgress(this.kpi, startDate, endDate);

      if (!this.progressCollection.length) {
        const query = getKPIProgressQuery(this.kpi, startDate, endDate);
        await this.$bind('progressCollection', query);
      }

      this.isProgressLoading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.kpi-card-widget {
  gap: 0.75rem;
  margin: 0;
  line-height: 1;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    min-height: 2.25rem;
  }

  &__trend {
    display: flex;
  }

  &__graph {
    display: flex;
    flex-grow: 1;
    align-self: center;
    min-width: 8rem;
    max-width: 50%;
  }

  ::v-deep .widget__header {
    align-items: flex-start;
  }

  .drag-icon {
    --fg-color: var(--color-grayscale-30);
    cursor: move;

    ::v-deep svg {
      height: 0.875rem;
      min-height: 0.875rem;
    }
  }

  .no-data {
    flex: 1;
    align-self: center;
    text-align: center;
  }

  @include bp('tablet-big-up') {
    &__inner {
      flex-direction: row;
    }

    &__trend {
      flex-basis: 50%;
      flex-shrink: 0;
    }

    &__graph {
      flex-basis: 20%;
      flex-shrink: 0;
      min-width: auto;
      height: 5rem;
    }
  }

  &--compact {
    .no-data {
      text-align: left;
    }

    .kpi-card-widget__graph {
      display: none;
    }

    .kpi-card-widget__inner {
      min-height: auto;
    }

    @include bp('laptop-up') {
      .kpi-card-widget__graph {
        display: flex;
        height: 2.5rem;
      }
      .kpi-card-widget__inner {
        min-height: 2.25rem;
      }
    }
  }
}

.no-data {
  color: var(--color-grayscale-60);
  font-style: italic;
}
</style>
