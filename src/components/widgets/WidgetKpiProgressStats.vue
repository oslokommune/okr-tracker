<template>
  <widget>
    <div class="progressStatistics">
      <div>
        <span class="progressStatistics__title pkt-txt-14">
          <template v-if="latestProgressRecord">
            {{
              $t('kpi.latestValueTitle', {
                formattedDate: formatDate(latestProgressRecord.timestamp),
              })
            }}
          </template>
          <template v-else>
            {{ $t('kpi.currentValue') }}
          </template>
        </span>
        <div>
          <span class="progressStatistics__value pkt-txt-20-medium">
            {{ formattedKpiValue }}
          </span>
        </div>
      </div>

      <div v-if="goal">
        <span class="progressStatistics__title pkt-txt-14">
          {{
            $t('kpi.goals.goalTitle', {
              formattedDateRange: formatDateRange(goal.fromDate, goal.toDate),
            })
          }}
        </span>
        <div>
          <span class="progressStatistics__value pkt-txt-20-medium">
            {{ formatKPIValue(kpi, goal.value) }}
            <span v-if="isGoalReached" class="check-icon">
              <pkt-icon name="check-medium" />
            </span>
          </span>
        </div>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { periodDates, dateLongCompact } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import WidgetWrapper from './WidgetWrapper.vue';

export default {
  name: 'WidgetKpiProgressStats',

  components: {
    Widget: WidgetWrapper,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    progress: {
      type: Array,
      default: () => [],
    },
    goals: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  computed: {
    ...mapState('kpis', ['selectedPeriod']),

    formattedKpiValue() {
      return this.latestProgressRecord
        ? formatKPIValue(this.kpi, this.latestProgressRecord.value)
        : formatKPIValue(this.kpi);
    },

    latestProgressRecord() {
      return this.progress.length ? this.progress[0] : null;
    },

    goal() {
      // Firebase doesn't support equality filtering on more than one field at
      // a time, so do the rest of the filtering client side.
      const { startDate, endDate } = this.selectedPeriod;

      const goals = this.goals.filter(
        (goal) => goal.toDate.toDate() > startDate && goal.fromDate.toDate() < endDate
      );

      // We don't enforce non-overlapping goals (yet?), but if anyone has set
      // overlapping goals, just pick the one with the closest end date.
      return goals ? goals[0] : null;
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

      const record = progressRecordsInGoalPeriod[0];
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
.progressStatistics {
  display: grid;
  gap: 2rem;

  @each $bp-name, $cols in ('phablet-up': 2, 'tablet-up': 3) {
    @include bp('#{$bp-name}') {
      grid-template-columns: repeat(#{$cols}, 1fr);
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__title {
    color: var(--color-dark-blue);
  }

  &__value {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    .check-icon {
      width: 1.25rem;
      height: 1.25rem;
      line-height: 1.25rem;
      text-align: center;
      background-color: var(--color-green-light);
      border-radius: 50%;
    }
  }
}
</style>
