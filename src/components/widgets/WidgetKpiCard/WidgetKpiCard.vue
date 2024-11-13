<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { formatKPIValue } from '@/util/kpiHelpers';
import { getComputedStyleVariable, DEFAULT_SERIES_OPTIONS } from '@/util/chart';
import { useAuthStore } from '@/store/auth';
import { useKpi } from '@/composables/kpi';
import LineChart from '@/components/generic/LineChart.vue';
import PeriodTrendTag from '@/components/widgets/PeriodTrendTag.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

const i18n = useI18n();

const props = defineProps({
  kpiId: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { kpi, isLoading, period, progress } = useKpi(props.kpiId);
const { hasEditRights } = storeToRefs(useAuthStore());

const progressIsFiltered = computed(() => period?.key !== 'all');

const chartSeries = computed(() => [
  {
    ...DEFAULT_SERIES_OPTIONS,
    name: i18n.t('kpi.progress'),
    data: progress.value.map((r) => [
      r.timestamp.toDate().toISOString(),
      r.value,
      r.comment,
    ]),
    color: getComputedStyleVariable('--color-blue-light'),
    showSymbol: false,
    areaStyle: { opacity: 0.25 },
    lineStyle: { width: 2 },
  },
]);

const chartOptions = computed(() => ({
  yMin: kpi.value.startValue === 'min' ? null : 0,
  valueFormatter: (val) => formatKPIValue(kpi.value, val),
}));
</script>

<template>
  <WidgetWrapper
    v-if="kpi"
    size="small"
    :title="kpi.name"
    :class="['kpi-card-widget', { 'kpi-card-widget--compact': compact }]"
  >
    <template v-if="hasEditRights" #title-actions>
      <PktIcon class="drag-icon" name="drag" />
    </template>

    <div class="kpi-card-widget__inner">
      <div class="kpi-card-widget__trend">
        <PeriodTrendTag
          v-if="progress.length"
          :kpi="kpi"
          :progress="progress"
          :compact="compact"
        />
        <span v-else-if="!isLoading" class="no-data pkt-txt-14">
          {{ $t(`kpi.${progressIsFiltered ? 'noDataFiltered' : 'noData'}`) }}
        </span>
      </div>

      <div
        :class="[
          'kpi-card-widget__graph',
          { 'kpi-card-widget__graph--compact': compact },
        ]"
      >
        <LineChart
          v-if="progress.length > 1"
          v-bind="chartOptions"
          :series="chartSeries"
          sparkline
        />
        <span v-else-if="progress.length === 1" class="no-data pkt-txt-12">
          {{ $t('kpi.noGraph') }}
        </span>
      </div>
    </div>
  </WidgetWrapper>
</template>

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

  :deep(.widget__header) {
    align-items: flex-start;
  }

  .drag-icon {
    --fg-color: var(--color-grayscale-30);
    cursor: move;

    :deep(svg) {
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
