<template>
  <div
    v-if="kpi && progress.length"
    :class="['period-trend', { 'period-trend--compact': compact }]"
  >
    <div v-if="!compact && progress.length > 1" class="period-trend__value-wrapper">
      <span class="period-trend__value">
        {{ formatKPIValue(kpi, firstProgressRecord.value) }}
      </span>
      <span class="period-trend__date">
        {{ formatDate(firstProgressRecord.timestamp) }}
      </span>
    </div>
    <span
      v-if="progress.length > 1"
      :class="[
        'period-trend__trend-tag',
        `period-trend__trend-tag--${trendClassModifier}`,
      ]"
    >
      {{ periodTrendFormatted }}
    </span>
    <div class="period-trend__value-wrapper">
      <span class="period-trend__value">
        {{ formatKPIValue(kpi, latestProgressRecord.value) }}
      </span>
      <span v-if="!compact" class="period-trend__date">
        {{ formatDate(latestProgressRecord.timestamp) }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { dateLongCompact } from '@/util';
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
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapState(['selectedPeriod']),

    periodTrend() {
      if (this.firstProgressRecord && this.latestProgressRecord) {
        const diff = this.latestProgressRecord.value - this.firstProgressRecord.value;
        return Math.round(diff * 100) / 100;
      }
      return null;
    },

    periodTrendFormatted() {
      if (this.periodTrend !== null) {
        const prefix = this.periodTrend > 0 ? '+' : '';
        const formattedTrend = formatKPIValue(this.kpi, this.periodTrend);
        return `${prefix + formattedTrend}`;
      }
      return '?';
    },

    firstProgressRecord() {
      return this.progress.length ? this.progress[this.progress.length - 1] : null;
    },

    latestProgressRecord() {
      return this.progress.length ? this.progress[0] : null;
    },

    trendClassModifier() {
      const ri = this.kpi;
      const preferredTrendIsSet = ri?.preferredTrend !== undefined;

      if (preferredTrendIsSet && this.periodTrend !== null) {
        const preferredTrendFulfilled =
          (ri?.preferredTrend === 'increase' && this.periodTrend > 0) ||
          (ri?.preferredTrend === 'decrease' && this.periodTrend < 0);

        return preferredTrendFulfilled ? 'positive' : 'negative';
      }
      return 'neutral';
    },
  },

  methods: {
    formatKPIValue,

    formatDate(date) {
      return dateLongCompact(date instanceof Date ? date : date.toDate());
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.period-trend {
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-around;
  font-weight: 500;
  font-size: typography.$font-size-2;
  white-space: nowrap;

  @media screen and (min-width: bp(s)) {
    font-size: typography.$font-size-5;
  }

  &__value-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  &__value {
    color: var(--color-text);
  }

  &__date {
    color: var(--color-grayscale-40);
    font-size: typography.$font-size-1;
  }

  &__trend-tag {
    position: relative;
    order: 0;
    margin-right: 0.5em;
    padding: 0 0.5em 0 1.5em;
    color: var(--color-blue-dark);
    font-size: 0.75em;
    line-height: 2;
    background: var(--color-blue-light);

    &--positive {
      color: var(--color-success);
      background: var(--color-green-light);
    }

    &--negative {
      color: #770d01; // TODO: når implementert i Punkt: var(--color-red-80);
      background: #f9b3ab; // TODO: når implementert i Punkt: var(--color-red-30);
    }

    &:before,
    &:after {
      position: absolute;
      top: 0;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      content: '';
    }

    &:before {
      left: 0;
      border-width: 1em 0 1em 0.75em;
      border-left-color: var(--color-white);
    }

    &:after {
      right: -0.75em;
      border-width: 1em 0 1em 0.75em;
      border-left-color: var(--color-blue-light);
    }

    &--positive:after {
      border-left-color: var(--color-green-light);
    }
    &--negative:after {
      border-left-color: #f9b3ab; // TODO: når implementert i Punkt: var(--color-red-30);
    }
  }

  &--compact {
    justify-content: flex-start;
    font-size: typography.$font-size-3;

    .period-trend__trend-tag {
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
