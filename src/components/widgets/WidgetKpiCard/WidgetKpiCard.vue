<template>
  <widget class="kpi-card-widget" size="small">
    <template #header>
      <h3 class="title-4">{{ kpi.name }}</h3>
    </template>

    <template #default>
      <div class="kpi-card-widget__inner">
        <template v-if="progress.length">
          <span class="kpi-card-widget__value">
            {{ formatKPIValue(kpi, latestProgressRecord.value) }}
          </span>
          <period-trend-tag
            v-if="progress.length > 1"
            :kpi="kpi"
            :progress="progress"
            :latest-progress-record="latestProgressRecord"
          />
          <div class="kpi-card-widget__graph">
            <mini-graph v-if="progress.length > 1" :kpi-data="progress" />
            <span v-else>{{ $t('kpi.noGraph') }}</span>
          </div>
        </template>
        <span v-else class="kpi-card-widget__no-progress">
          {{ $t(`kpi.${progressIsFiltered ? 'noDataFiltered' : 'noData'}`) }}
        </span>
      </div>
    </template>
  </widget>
</template>

<script>
import kpiProgress from '@/mixins/kpiProgress';
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

  mixins: [kpiProgress],

  props: {
    kpi: {
      type: Object,
      required: true,
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
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

::v-deep .widget__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--color-text);

  .title-3 {
    color: inherit;
  }

  .title-label {
    font-weight: 400;
    font-size: 0.75rem;
  }
}

.kpi-card-widget {
  gap: 0;

  &__inner {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    height: 2rem;
  }

  &__value {
    color: var(--color-blue-dark);
    font-weight: 500;
    font-size: typography.$font-size-3;
  }

  &__graph {
    flex-basis: 10rem;
    margin-left: auto;
    color: var(--color-grayscale-40);
    font-weight: 400;
    font-size: typography.$font-size-0;
  }

  &__no-progress {
    color: var(--color-grayscale-40);
    font-weight: 400;
    font-size: typography.$font-size-1;
  }
}
</style>
