<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { startOfDay } from 'date-fns';
import { useAuthStore } from '@/store/auth';
import { periodDates, uniqueBy } from '@/util';
import i18n from '@/locale/i18n';
import { PktButton } from '@oslokommune/punkt-vue';
import ItemTag from '@/components/ItemTag.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';

const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
  keyResults: {
    type: Array,
    required: false,
    default: () => [],
  },
});

const { user, isSuperAdmin, isAdminOfCurrentItemOrganization } = storeToRefs(
  useAuthStore()
);

const contributors = computed(() =>
  uniqueBy(
    props.keyResults.map((kr) => kr.parent).filter((item) => item.name),
    'id'
  ).sort((a, b) => a.name.localeCompare(b.name, i18n.locale))
);

const period = computed(() => {
  const { period: objectivePeriod, startDate, endDate } = props.objective;

  if (startDate && endDate) {
    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    };
  }
  if (objectivePeriod.startDate && objectivePeriod.endDate) {
    return {
      startDate: objectivePeriod.startDate.toDate(),
      endDate: objectivePeriod.endDate.toDate(),
    };
  }
  return null;
});

const periodProgression = computed(() => {
  if (!period.value) {
    return null;
  }

  const start = period.value.startDate.getTime();
  const end = period.value.endDate.getTime();
  const now = startOfDay(new Date()).getTime();

  if (now < start || now > end) {
    return null;
  }

  return (now - start) / (end - start);
});

const isMemberOfObjectiveParent = computed(() =>
  props.objective.parent.team?.includes(user.value.path)
);

const canEdit = computed(
  () =>
    isSuperAdmin.value ||
    isAdminOfCurrentItemOrganization.value ||
    isMemberOfObjectiveParent.value
);
</script>

<template>
  <div class="objective-details">
    <div class="objective-details__header">
      <h2>{{ objective.name }}</h2>

      <PktButton
        v-if="canEdit"
        v-tooltip="$t('btn.updateObjective')"
        skin="tertiary"
        variant="icon-only"
        size="small"
        icon-name="edit"
        @on-click="$emit('edit-objective')"
      />
    </div>

    <HTMLOutput
      v-if="objective.description"
      :html="objective.description"
      class="objective-details__description"
    />

    <div class="objective-details__tiles pkt-grid">
      <div
        v-if="objective.parent?.name"
        class="pkt-cell pkt-cell--span12 pkt-cell--span5-tablet-up"
      >
        <h4>{{ $t('objective.owner') }}</h4>
        <ItemTag :item="objective.parent" />
      </div>

      <div
        v-if="contributors.length"
        class="pkt-cell pkt-cell--span12 pkt-cell--span7-tablet-up"
      >
        <h4>{{ $t('objective.contributors') }}</h4>
        <ItemTag v-for="c in contributors" :key="c.id" :item="c" />
      </div>

      <div v-if="period" :class="['pkt-cell', 'pkt-cell--span12']">
        <h4>{{ $t('objective.period') }}</h4>
        <span>{{ periodDates(period) }}</span>
      </div>

      <div class="pkt-cell pkt-cell--span12">
        <h4 class="mb-size-32">{{ $t('objective.progressionTitle') }}</h4>
        <ProgressBar
          :progression="objective.progression"
          :secondary-progression="periodProgression"
          :secondary-value-label="$t('general.today')"
          :show-min-max-indicators="true"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.objective-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-white);
  border-left: 0.25rem solid var(--color-blue-dark);

  &__header {
    display: flex;
    justify-content: space-between;
    text-wrap: balance;

    h2 {
      @include get-text('pkt-txt-18-medium');
    }

    .pkt-btn {
      margin: -0.5rem -0.5rem 0 0;
    }
  }

  &__description {
    @include get-text('pkt-txt-16-light');
  }

  &__tiles {
    @include get-text('pkt-txt-14');

    h4 {
      @include get-text('pkt-txt-14-medium');
      margin-bottom: 0.25rem;
    }

    .item-tag:not(:last-child) {
      margin-right: 1rem;
    }
  }
}
</style>
