<template>
  <div class="progressStatistics">
    <div>
      <span class="progressStatistics__title">
        Siste verdi
        <template v-if="latestProgressRecord">
          per {{ formatDate(latestProgressRecord.timestamp) }}
        </template>
      </span>
      <div>
        <span class="progressStatistics__value">
          <template v-if="resultIndicator && latestProgressRecord">
            {{ formatKPIValue(resultIndicator, latestProgressRecord.value) }}
            <span v-if="periodTrend" :class="bgColor" class="progressStatistics__trend">
              {{ periodTrendFormatted }}
            </span>
          </template>
          <template v-else>–––</template>
        </span>
      </div>
    </div>
    <div>
      <span class="progressStatistics__title">
        {{ $t('kpi.goals.goal') }}
        <template v-if="resultIndicator && goal">
          for {{ formatDateRange(goal.fromDate, goal.toDate) }}
        </template>
      </span>
      <div>
        <span class="progressStatistics__value">
          <template v-if="resultIndicator && goal">
            {{ formatKPIValue(resultIndicator, goal.value) }}
            <icon-alert-success v-if="isGoalReached" :width="20" :height="20" />
          </template>
          <template v-else>–––</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { periodDates, dateLongCompact } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import i18n from '@/locale/i18n';
import IconAlertSuccess from './IconAlertSuccess.vue';

export default {
  name: 'ProgressStatistics',

  components: {
    IconAlertSuccess,
  },

  props: {
    resultIndicator: {
      type: Object,
      required: true,
    },
    progress: {
      type: Array,
      required: false,
      default: null,
    },
    goal: {
      type: Object,
      required: false,
      default: null,
    },
  },

  computed: {
    latestProgressRecord() {
      if (this.progress.length) {
        return this.progress.slice(-1)[0];
      }
      return null;
    },
    periodTrend() {
      const firstProgressRecord = this.progress[0]?.value;
      const latestProgressRecord = this.latestProgressRecord?.value;
      const diff = latestProgressRecord - firstProgressRecord;
      return Math.round(diff * 100) / 100;
    },
    periodTrendFormatted() {
      if (this.periodTrend === 0) {
        return i18n.t('kpi.noChange');
      }
      const prefix = this.periodTrend > 0 ? '+' : '';
      const formattedTrend = formatKPIValue(this.resultIndicator, this.periodTrend);

      return `${prefix + formattedTrend} ${i18n.t('kpi.inPeriod')}`;
    },
    bgColor() {
      const ri = this.resultIndicator;
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
    isGoalReached() {
      if (!this.goal || !this.goal.value || !this.progress.length) {
        return null;
      }

      const fromDate = this.goal.fromDate.toDate();
      const toDate = this.goal.toDate.toDate();

      const progressRecordsInGoalPeriod = this.progress.filter((record) => {
        const recordDate = record.timestamp.toDate();
        return recordDate >= fromDate && recordDate <= toDate;
      });

      if (!progressRecordsInGoalPeriod.length) {
        return false;
      }

      const record = progressRecordsInGoalPeriod.slice(-1)[0];
      return record.value >= this.goal.value;
    },
  },

  methods: {
    formatKPIValue,

    formatDate(date) {
      return dateLongCompact(date instanceof Date ? date : date.toDate());
    },

    formatDateRange(startDate, endDate) {
      return periodDates({ startDate, endDate }, dateLongCompact);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.progressStatistics {
  display: grid;
  gap: 2rem;
  min-height: 5.7rem;
  margin-top: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-grey-100);

  @each $bp, $cols in (s: 2, m: 3, l: 4) {
    @media screen and (min-width: bp(#{$bp})) {
      grid-template-columns: repeat(#{$cols}, 1fr);
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  &__title {
    color: var(--color-grayscale-40);
    font-weight: 500;
    font-size: typography.$font-size-1;
  }
  &__value {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-text);
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
  color: var(--color-info);
  background: var(--color-blue-dark-5);
}

.positive {
  color: var(--color-success);
  background: var(--color-green-dark-5);
}

.negative {
  color: var(--color-error);
  background: var(--color-red-5);
}
</style>
