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

<script>
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
        let formattedTrend = formatKPIValue(this.kpi, this.periodTrend);
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
    },

    firstProgressRecord() {
      return this.progress.length ? this.progress[this.progress.length - 1] : null;
    },

    latestProgressRecord() {
      return this.progress.length ? this.progress[0] : null;
    },

    trendClassModifier() {
      const preferredTrend = this.kpi?.preferredTrend;

      if ([undefined, 'neutral'].includes(preferredTrend) || !this.periodTrend) {
        return 'neutral';
      }

      const preferredTrendFulfilled =
        (preferredTrend === 'increase' && this.periodTrend > 0) ||
        (preferredTrend === 'decrease' && this.periodTrend < 0);

      return preferredTrendFulfilled ? 'positive' : 'negative';
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
