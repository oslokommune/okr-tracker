<script setup>
import { computed, toValue } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { periodDates, dateLongCompact } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import { useActiveKpiStore } from '@/store/activeKpi';
import WidgetWrapper from './WidgetWrapper.vue';

const i18n = useI18n();

const { kpi, progress, period, goals } = storeToRefs(useActiveKpiStore());

const firstProgressRecord = computed(() =>
  progress.value.length ? progress.value[progress.value.length - 1] : null
);
const latestProgressRecord = computed(() =>
  progress.value.length ? progress.value[0] : null
);

const latestGoal = computed(() => {
  // Firebase doesn't support equality filtering on more than one field at
  // a time, so do the rest of the filtering client side.
  const { startDate, endDate } = period.value;

  const filteredGoals = goals.value.filter(
    (goal) =>
      goal.value && goal.toDate.toDate() > startDate && goal.fromDate.toDate() < endDate
  );

  // We don't enforce non-overlapping goals (yet?), but if anyone has set
  // overlapping goals, just pick the one with the closest end date.
  return filteredGoals.length ? filteredGoals[0] : null;
});

const isGoalReached = computed(() => {
  const goal = toValue(latestGoal);

  if (!goal || !goal.value || !progress.value.length) {
    return null;
  }
  const fromDate = goal.fromDate.toDate();
  const toDate = goal.toDate.toDate();

  const progressRecordsInGoalPeriod = progress.value.filter((record) => {
    const recordDate = record.timestamp.toDate();
    return recordDate >= fromDate && recordDate <= toDate;
  });

  if (!progressRecordsInGoalPeriod.length) {
    return false;
  }

  const record = progressRecordsInGoalPeriod[0];
  return record.value >= goal.value;
});

function formatDate(date) {
  return dateLongCompact(date instanceof Date ? date : date.toDate());
}

function formatDateRange(startDate, endDate) {
  return periodDates({ startDate, endDate }, dateLongCompact);
}

const valueCountDateRange = computed(() => {
  if (progress.value.length > 1) {
    return formatDateRange(
      firstProgressRecord.value.timestamp,
      latestProgressRecord.value.timestamp
    );
  }
  if (progress.value.length === 1) {
    return formatDate(latestProgressRecord.value.timestamp);
  }
  return null;
});

const stats = computed(() =>
  [
    {
      title: i18n.t('kpi.latestValue'),
      subtitle: latestProgressRecord.value
        ? formatDate(latestProgressRecord.value.timestamp)
        : null,
      value: latestProgressRecord.value
        ? formatKPIValue(kpi.value, latestProgressRecord.value.value)
        : '–––',
    },
    {
      title: i18n.t('kpi.valueCount'),
      subtitle: valueCountDateRange.value,
      value: progress.value.length,
    },
    latestGoal.value
      ? {
          title: i18n.t('kpi.goals.goal'),
          subtitle: formatDateRange(latestGoal.value.fromDate, latestGoal.value.toDate),
          value: formatKPIValue(kpi.value, latestGoal.value.value),
          checkmark: isGoalReached.value,
        }
      : null,
  ].filter((s) => !!s)
);
</script>

<template>
  <WidgetWrapper>
    <div class="progressStatistics">
      <div
        v-for="{ title, subtitle, value, checkmark } in stats"
        :key="title"
        class="progressStatistics__stat"
      >
        <span class="pkt-txt-14-medium">{{ title }}</span>
        <span class="pkt-txt-12">
          <template v-if="subtitle">{{ subtitle }}</template>
        </span>
        <span class="pkt-txt-20-medium">
          {{ value }}
          <PktIcon v-if="checkmark" name="check-medium" />
        </span>
      </div>
    </div>
  </WidgetWrapper>
</template>

<style lang="scss" scoped>
.progressStatistics {
  display: grid;
  gap: 2rem;

  @each $bp-name, $cols in ('phablet-up': 2, 'tablet-up': 3) {
    @include bp('#{$bp-name}') {
      grid-template-columns: repeat(#{$cols}, 1fr);
    }
  }

  &__stat {
    display: flex;
    flex-direction: column;

    > span:nth-child(2) {
      min-height: 1.25rem;
      color: var(--pkt-color-grays-gray-500);
    }

    > span:nth-child(3) {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      .pkt-icon {
        width: 1.25rem;
        height: 1.25rem;
        line-height: 1.25rem;
        text-align: center;
        background-color: var(--color-green-light);
        border-radius: 50%;
      }
    }
  }
}
</style>
