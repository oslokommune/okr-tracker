<template>
  <div v-if="resultIndicator" class="progressStatistics">
    <div v-if="latestProgressRecord">
      <span class="progressStatistics__title">
        {{
          $t('kpi.latestValueTitle', {
            formattedDate: formatDate(latestProgressRecord.timestamp),
          })
        }}
      </span>
      <div>
        <period-trend-tag :kpi="resultIndicator" />
      </div>
    </div>
    <div v-if="goal">
      <span class="progressStatistics__title">
        {{
          $t('kpi.goals.goalTitle', {
            formattedDateRange: formatDateRange(goal.fromDate, goal.toDate),
          })
        }}
      </span>
      <div>
        <span class="progressStatistics__value">
          {{ formatKPIValue(resultIndicator, goal.value) }}
          <pkt-icon v-if="isGoalReached" name="alert-success" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { periodDates, dateLongCompact } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'ProgressStatistics',

  components: {
    PeriodTrendTag: () => import('@/components/widgets/PeriodTrendTag.vue'),
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
  padding: 1.5rem;

  @each $bp, $cols in (s: 2, m: 3) {
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

    svg {
      height: 1.25rem;
    }
  }
}
</style>
