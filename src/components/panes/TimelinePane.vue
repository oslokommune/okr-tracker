<template>
  <pane-wrapper class="timeline-pane">
    <template #title>
      <h1 class="pkt-txt-18-medium pkt-hide-desktop-up">
        {{ $t('general.OKRsLong') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-desktop-up">
        {{ $t('general.OKRsLonger', { name: activeItem.name }) }}
      </h1>
    </template>

    <template #actions>
      <pkt-button
        v-if="hasEditRights"
        :text="$t('btn.createObjective')"
        skin="primary"
        size="small"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="$emit('add-objective')"
      />
    </template>

    <gantt-chart
      :objectives="objectivesWithID"
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
    ...mapState(['activeItem', 'dataLoading', 'selectedPeriod']),
    ...mapGetters(['objectivesWithID', 'hasEditRights']),
  },
};
</script>

<style lang="scss" scoped>
.timeline-pane {
  ::v-deep .pane__actions {
    top: 1rem;
    right: 1rem;
  }

  ::v-deep .pane__inner {
    height: 100%;
    padding: 0;
  }

  ::v-deep .pane__header {
    padding: 1.5rem;
    padding-bottom: 0;
  }

  ::v-deep .pane__body {
    flex: 1 0 auto;
    height: 0;
    padding: 0;
  }
}
</style>
