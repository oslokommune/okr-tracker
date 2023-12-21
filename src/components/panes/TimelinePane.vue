<template>
  <pane-wrapper class="timeline-pane">
    <template #title>
      <h1 class="pkt-txt-16-medium pkt-hide-phablet-up">
        {{ $t('general.OKRsLong') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-phablet-up pkt-hide-tablet-big-up">
        {{ $t('general.OKRsLong') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-tablet-big-up">
        {{ $t('general.OKRsLonger', { name: activeItem.name }) }}
      </h1>
    </template>

    <template #actions>
      <pkt-button
        v-if="hasEditRights"
        :text="$t('general.objective')"
        :aria-label="$t('btn.createObjective')"
        skin="primary"
        size="small"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="$emit('add-objective')"
      />
    </template>

    <gantt-chart
      :objectives="timelineObjectives"
      :period="selectedPeriod"
      :loading="dataLoading"
    />
  </pane-wrapper>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import GanttChart from '@/components/GanttChart.vue';

export default {
  name: 'TimelinePane',

  components: {
    PaneWrapper,
    GanttChart,
    PktButton,
  },

  computed: {
    ...mapState(['activeItem', 'dataLoading']),
    ...mapState('okrs', ['selectedPeriod']),
    ...mapGetters(['hasEditRights']),
    ...mapGetters('okrs', ['timelineObjectives']),
  },
};
</script>

<style lang="scss" scoped>
.timeline-pane {
  ::v-deep .pane__inner {
    height: 100%;
  }

  ::v-deep .pane__header {
    padding: 0 1rem 0 1.4375rem;
  }

  ::v-deep .pane__title {
    padding: 0;

    h1 {
      line-height: 4.25rem;
      white-space: nowrap;
    }
  }

  ::v-deep .pane__actions {
    margin-top: 0.4rem;
  }

  ::v-deep .pane__body {
    flex: 1 0 auto;
    height: 0;
    padding: 0;
  }
}
</style>
