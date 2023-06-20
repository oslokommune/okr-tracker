<template>
  <page-layout>
    <template #default>
      <header class="itemOKRs__header">
        <h2 class="title-1">{{ $t('general.OKRsLong') }}</h2>
        <div data-mode="dark">
          <pkt-button
            v-tooltip="$t('btn.createObjective')"
            :text="$t('btn.createObjective')"
            skin="primary"
            variant="icon-left"
            icon-name="plus-sign"
            @onClick="$emit('click', openObjectiveDrawer())"
          />
        </div>
      </header>

      <section>
        <content-loader-action-bar
          v-if="dataLoading"
          class="itemHome__header--content-loader"
        ></content-loader-action-bar>
        <action-bar v-else-if="periodObjectives.length" />
        <content-loader-item v-if="dataLoading"></content-loader-item>
        <empty-state
          v-else-if="!periodObjectives.length && !dataLoading"
          :icon="'exclamation'"
          :heading="$t('empty.noPeriods.heading')"
          :body="$t('empty.noPeriods.body')"
        >
        </empty-state>
        <div v-if="periodObjectives.length && !dataLoading">
          <ul v-if="['compact', 'details'].includes(view)">
            <li
              v-for="objective in periodObjectives"
              :key="objective.id"
              class="itemHome__objectives--item"
            >
              <objective-row :objective="objective" :show-description="true">
              </objective-row>
              <ul v-if="objective.keyResults.length">
                <li
                  v-for="keyResult in objective.keyResults"
                  :key="keyResult.id"
                  class="keyResultRow"
                  :class="{ 'keyResultRow--isCompact': view === 'compact' }"
                >
                  <key-result-row :key-result="keyResult"></key-result-row>
                </li>
              </ul>
            </li>
          </ul>
          <gantt-chart
            v-else-if="view === 'timeline'"
            :objectives="periodObjectives"
            :item="activeItem"
          />
        </div>
      </section>
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';
import { objectiveInPeriod } from '@/util/okr';
import { periodDates } from '@/util';
import routerGuard from '@/router/router-guards/itemOKRs';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from '@/components/ContentLoader/ContentLoaderActionBar.vue';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ItemHome',

  components: {
    ActionBar: () => import('@/components/ActionBar.vue'),
    GanttChart: () => import('@/components/GanttChart.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    ContentLoaderItem,
    ContentLoaderActionBar,
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

    periodObjectives() {
      if (!this.selectedPeriod) {
        return [];
      }

      return this.objectives
        .filter((o) => objectiveInPeriod(this.selectedPeriod, o))
        .map((o) => ({
          ...o,
          id: o.id,
          keyResults: this.keyResults.filter(
            (kr) => kr.objective === `objectives/${o.id}`
          ),
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

    periodDates,
  },
};
</script>

<style lang="scss" scoped>
.itemOKRs__header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 1rem;
}

.keyResultRow {
  &:not(:first-child) {
    margin-top: 4px;
  }

  &--isCompact {
    @media screen and (min-width: bp(s)) {
      &:not(:first-child) {
        margin-top: 1px;
      }
    }
  }
}

.itemHome__objectives--item {
  margin-bottom: 1rem;
  border: 2px solid var(--color-border);

  > ul {
    padding-bottom: 0.5rem;
  }
}
</style>
