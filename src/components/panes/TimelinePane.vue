<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import GanttChart from '@/components/GanttChart.vue';

const { hasEditRights } = storeToRefs(useAuthStore());
const { item } = storeToRefs(useActiveItemStore());
</script>

<template>
  <PaneWrapper class="timeline-pane">
    <template #title>
      <h1 class="pkt-txt-16-medium pkt-hide-tablet-up">
        {{ $t('general.OKRsLong') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-tablet-up pkt-hide-tablet-big-up">
        {{ $t('general.OKRsLong') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-tablet-big-up">
        {{ $t('general.OKRsLonger', { name: item.name }) }}
      </h1>
    </template>

    <template #actions>
      <pkt-button
        v-if="hasEditRights"
        :aria-label="$t('btn.createObjective')"
        skin="primary"
        size="small"
        variant="icon-left"
        iconName="plus-sign"
        @click="$emit('add-objective')"
      >
        <span>{{ $t('general.objective') }}</span>
      </pkt-button>
    </template>

    <GanttChart />
  </PaneWrapper>
</template>

<style lang="scss" scoped>
.timeline-pane {
  :deep(.pane__inner) {
    height: 100%;
  }

  :deep(.pane__header) {
    padding: 0 1rem 0 1.4375rem;
  }

  :deep(.pane__title) {
    padding: 0;

    h1 {
      line-height: 4.25rem;
      white-space: nowrap;
    }
  }

  :deep(.pane__actions) {
    margin-top: 0.4rem;
  }

  :deep(.pane__body) {
    flex: 1 0 auto;
    height: 0;
    padding: 0;
  }
}
</style>
