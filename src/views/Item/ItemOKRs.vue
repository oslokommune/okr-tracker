<template>
  <page-layout
    v-if="objectivesWithID.length || dataLoading"
    breakpoint="full"
    :sidebar-grid="false"
    :sidebar-cols="5"
  >
    <template #default>
      <div class="okrs-timeline">
        <div class="okrs-timeline__header">
          <h1 class="pkt-txt-24-medium">{{ $t('general.OKRsLong') }}</h1>

          <div v-if="hasEditRights" data-mode="dark">
            <pkt-button
              v-tooltip="$t('btn.createObjective')"
              :text="$t('btn.createObjective')"
              skin="primary"
              variant="icon-left"
              icon-name="plus-sign"
              @onClick="showObjectiveDrawer = true"
            />
          </div>
        </div>

        <div class="okrs-timeline__body">
          <gantt-chart
            v-if="dataLoading || objectivesWithID.length"
            :objectives="objectivesWithID"
            :period="selectedPeriod"
            :loading="dataLoading"
          />
          <empty-state
            v-else
            :heading="$t('empty.noObjectivesInPeriod.heading')"
            :body="$t('empty.noObjectivesInPeriod.body')"
          />
        </div>
      </div>

      <objective-drawer
        :visible="showObjectiveDrawer"
        :newest-objective="newestObjective"
        @close="showObjectiveDrawer = false"
      />
    </template>

    <template v-if="selectedObjectives?.length" #sidebar>
      <objective-workbench />
    </template>
  </page-layout>

  <empty-page
    v-else
    :heading="$t('empty.noObjectives.heading')"
    :body="$t('empty.noObjectives.body')"
  >
    <div v-if="hasEditRights" data-mode="dark">
      <pkt-button
        :text="$t('btn.createObjective')"
        skin="primary"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="showObjectiveDrawer = true"
      />
    </div>

    <objective-drawer
      :visible="showObjectiveDrawer"
      @close="showObjectiveDrawer = false"
    />
  </empty-page>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import EmptyState from '@/components/EmptyState.vue';
import GanttChart from '@/components/GanttChart.vue';
import ObjectiveDrawer from '@/components/drawers/EditObjective.vue';
import ObjectiveWorkbench from '@/components/ObjectiveWorkbench.vue';
import routerGuard from '@/router/router-guards/itemOKRs';

export default {
  name: 'ItemHome',

  components: {
    GanttChart,
    EmptyState,
    EmptyPage,
    ObjectiveWorkbench,
    ObjectiveDrawer,
    PktButton,
  },

  beforeRouteUpdate: routerGuard,

  data: () => ({
    showObjectiveDrawer: false,
  }),

  computed: {
    ...mapState(['activeItem', 'dataLoading', 'selectedPeriod', 'user']),
    ...mapGetters(['objectivesWithID', 'selectedObjectives', 'hasEditRights']),

    view() {
      return this.user.preferences.view;
    },

    /**
     * Return the most recently created objective for the current item.
     */
    newestObjective() {
      if (!this.objectivesWithID.length) {
        return null;
      }

      return this.objectivesWithID.slice().sort((a, b) => {
        if (a.created && b.created) {
          return a.created.seconds > b.created.seconds ? -1 : 1;
        }
        return 0;
      })[0];
    },
  },

  async created() {
    try {
      await this.setDataLoading(true);
      await this.set_active_period_and_data({
        item: this.activeItem,
      });
    } catch (e) {
      console.log(e);
    } finally {
      await this.setDataLoading(false);
    }
  },

  methods: {
    ...mapActions(['set_active_period_and_data', 'setDataLoading']),
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.page {
  ::v-deep .page__container,
  ::v-deep .page__main,
  ::v-deep .page__sidebar {
    gap: 0;
    height: 100%;
    padding: 0;
  }

  ::v-deep .page__sidebar {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-grayscale-10);

    @include bp('tablet-big-up') {
      border-top: unset;
      border-left: 1px solid var(--color-grayscale-10);
    }
  }
}

.okrs-timeline {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
  }

  &__body {
    flex: 1 0 auto;
    height: 0;
  }
}

.objective-workbench {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  height: 0;
  overflow: auto;
}
</style>
