<script setup>
import { computed } from 'vue';
import { dateLongCompact } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';

const props = defineProps({
  kpi: {
    type: Object,
    required: true,
  },
  progress: {
    type: Array,
    required: true,
  },
  compact: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const firstProgressRecord = computed(() =>
  props.progress.length ? props.progress[props.progress.length - 1] : null
);
const latestProgressRecord = computed(() =>
  props.progress.length ? props.progress[0] : null
);

const periodTrend = computed(() => {
  if (firstProgressRecord.value && latestProgressRecord.value) {
    const diff = latestProgressRecord.value.value - firstProgressRecord.value.value;
    return Math.round(diff * 100) / 100;
  }
  return null;
});

const trendClassModifier = computed(() => {
  const preferredTrend = props.kpi?.preferredTrend;
  if ([undefined, 'neutral'].includes(preferredTrend) || !periodTrend.value) {
    return 'neutral';
  }
  const preferredTrendFulfilled =
    (preferredTrend === 'increase' && periodTrend.value > 0) ||
    (preferredTrend === 'decrease' && periodTrend.value < 0);
  return preferredTrendFulfilled ? 'positive' : 'negative';
});

const periodTrendFormatted = computed(() => {
  if (periodTrend.value !== null) {
    const prefix = periodTrend.value > 0 ? '+' : '';
    let formattedTrend = formatKPIValue(props.kpi, periodTrend.value);
    /*
     * The percentage sign is misleading when used to indicate a value
     * difference like here, as the computed change is actually in
     * percentage points/absolute value, and not in percentage change.
     */
    if (formattedTrend.endsWith('%')) {
      formattedTrend = formattedTrend.slice(0, formattedTrend.length - 1);
    }
    return `${prefix + formattedTrend}`;
  }
  return '?';
});

function formatDate(date) {
  return dateLongCompact(date instanceof Date ? date : date.toDate());
}
</script>

<template>
  <div
    v-if="kpi && progress.length"
    :class="['period-trend-tag', { 'period-trend-tag--compact': compact }]"
  >
    <div v-if="!compact && progress.length > 1" class="period-trend-tag__value-wrapper">
      <span class="period-trend-tag__value">
        {{ formatKPIValue(kpi, firstProgressRecord.value) }}
      </span>
      <span class="period-trend-tag__date pkt-txt-14">
        {{ formatDate(firstProgressRecord.timestamp) }}
      </span>
    </div>
    <span
      v-if="progress.length > 1"
      :class="[
        'period-trend-tag__trend',
        `period-trend-tag__trend--${trendClassModifier}`,
      ]"
    >
      {{ periodTrendFormatted }}
    </span>
    <div class="period-trend-tag__value-wrapper">
      <span class="period-trend-tag__value">
        {{ formatKPIValue(kpi, latestProgressRecord.value) }}
      </span>
      <span v-if="!compact" class="period-trend-tag__date pkt-txt-14">
        {{ formatDate(latestProgressRecord.timestamp) }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.period-trend-tag {
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-around;
  font-weight: 400;
  white-space: nowrap;

  @include bp('phablet-up') {
    @include get-text('pkt-txt-24');
  }

  &__value-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    text-align: center;
  }

  &__value {
    color: var(--color-text);
  }

  &__date {
    color: var(--color-grayscale-60);
  }

  &__trend {
    position: relative;
    order: 0;
    padding: 0 1.5em;
    color: var(--color-blue-dark);
    font-size: 0.75em;
    line-height: 2;
    background: var(--pkt-color-surface-default-light-blue);

    &--positive {
      background: var(--pkt-color-surface-default-light-green);
    }

    &--negative {
      background: var(--pkt-color-surface-default-faded-red);
    }

    &:before,
    &:after {
      position: absolute;
      top: 0;
      width: 0;
      height: 100%;
      border-color: transparent;
      border-style: solid;
      border-width: 1em 0 1em 0.76em;
      content: '';
    }

    &:before {
      left: 0;
      border-left-color: var(--color-white);
    }

    &:after {
      right: 0;
      border-top-color: var(--color-white);
      border-bottom-color: var(--color-white);
    }
  }

  &--compact {
    @include get-text('pkt-txt-18');
    justify-content: flex-start;

    .period-trend-tag__trend {
      order: 1;
      padding: 0 0.25rem;
      line-height: 1.5;

      &:after,
      &:before {
        display: none;
      }
    }
  }
}
</style>
