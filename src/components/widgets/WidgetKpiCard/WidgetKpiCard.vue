<template>
  <widget
    size="small"
    :class="['kpi-card-widget', { 'kpi-card-widget--compact': compact }]"
  >
    <template #header>
      <h3 class="title-3">{{ kpi.name }}</h3>
    </template>

    <template #default>
      <div class="kpi-card-widget__inner">
        <div class="kpi-card-widget__trend">
          <period-trend-tag
            v-if="progress.length"
            :kpi="kpi"
            :progress="progress"
            :compact="compact"
          />
          <span v-else-if="!isProgressLoading" class="no-data">
            {{ $t(`kpi.${progressIsFiltered ? 'noDataFiltered' : 'noData'}`) }}
          </span>
        </div>

        <div class="kpi-card-widget__graph">
          <mini-graph
            v-if="progress.length > 1"
            :kpi-data="progress"
            :start-value="kpi.startValue"
            :compact="compact"
          />
          <span v-else-if="progress.length === 1" class="no-data">{{
            $t('kpi.noGraph')
          }}</span>
        </div>
      </div>
    </template>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import {
  filterDuplicatedProgressValues,
  formatKPIValue,
  getCachedKPIProgress,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import PeriodTrendTag from '@/components/widgets/PeriodTrendTag.vue';
import WidgetWrapper from '../WidgetWrapper.vue';
import MiniGraph from './MiniGraph.vue';

export default {
  name: 'WidgetKpiCard',

  components: {
    Widget: WidgetWrapper,
    PeriodTrendTag,
    MiniGraph,
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
    ...mapState(['selectedPeriod']),

    progress() {
      return filterDuplicatedProgressValues(this.progressCollection);
    },

    progressIsFiltered() {
      return this.selectedPeriod?.key !== 'all';
    },

    latestProgressRecord() {
      return this.progress.length ? this.progress[0] : null;
    },
  },

  watch: {
    kpi: {
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
@use '@/styles/typography';

.kpi-card-widget {
  gap: 0.75rem;
  margin: 0;

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

    .no-data {
      font-size: typography.$font-size-0;
    }
  }

  .no-data {
    flex: 1;
    align-self: center;
    text-align: center;
  }

  @media screen and (min-width: bp(m)) {
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
    }
  }

  &--compact {
    .no-data {
      text-align: left;
    }

    @media screen and (max-width: bp(m)) {
      .kpi-card-widget__inner {
        min-height: auto;
      }

      .kpi-card-widget__graph {
        display: none;
      }
    }
  }
}

.no-data {
  color: var(--color-grayscale-40);
  font-weight: 400;
  font-size: typography.$font-size-1;
  font-style: italic;
}
</style>
