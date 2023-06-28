<template>
  <page-layout
    v-if="objectives.length || dataLoading"
    breakpoint="full"
    :class="{ 'okrs--timeline': objectives.length }"
  >
    <template #header>
      <h1 class="pkt-txt-24-medium">{{ $t('general.OKRsLong') }}</h1>

      <div v-if="hasEditRights" data-mode="dark">
        <pkt-button
          v-tooltip="$t('btn.createObjective')"
          :text="$t('btn.createObjective')"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="$emit('click', openObjectiveDrawer())"
        />
      </div>
    </template>

    <template #default>
      <content-loader-item v-if="dataLoading" />

      <gantt-chart
        v-else-if="objectives.length"
        :objectives="_objectives"
        :period="selectedPeriod"
      />

      <empty-state
        v-else
        :heading="$t('empty.noObjectivesInPeriod.heading')"
        :body="$t('empty.noObjectivesInPeriod.body')"
      />
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
        @onClick="$emit('click', openObjectiveDrawer())"
      />
    </div>
  </empty-page>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';
import routerGuard from '@/router/router-guards/itemOKRs';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ItemHome',

  components: {
    GanttChart: () => import('@/components/GanttChart.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    EmptyPage: () => import('@/components/pages/EmptyPage.vue'),
    ContentLoaderItem,
    PktButton,
  },

  beforeRouteUpdate: routerGuard,

  data: () => ({
    activeTab: 0,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'dataLoading',
      'keyResults',
      'objectives',
      'selectedPeriod',
      'user',
    ]),
    ...mapGetters(['hasEditRights']),

    view() {
      return this.user.preferences.view;
    },

    /**
     * Return `this.objectives` enriched with ID and key results.
     */
    _objectives() {
      return this.objectives.map((o) => ({
        ...o,
        id: o.id,
        keyResults: this.keyResults.filter((kr) => kr.objective === `objectives/${o.id}`),
      }));
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
    ...mapMutations(['TOGGLE_DRAWER']),

    openObjectiveDrawer() {
      this.TOGGLE_DRAWER({
        type: 'objective',
        show: 'true',
        content: null,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  ::v-deep &__header {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: space-between;
  }
  &.okrs--timeline {
    background-color: var(--color-gray-light);

    ::v-deep .page__container,
    ::v-deep .page__main {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 0;
      padding: 0;
    }

    .gantt {
      flex-grow: 1;
    }
  }
}
</style>
