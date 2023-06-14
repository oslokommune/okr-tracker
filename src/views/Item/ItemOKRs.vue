<template>
  <page-layout v-if="objectives.length || dataLoading">
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
        <template v-if="dataLoading">
          <content-loader-action-bar />
          <content-loader-item />
        </template>

        <template v-else>
          <action-bar />

          <template v-if="periodObjectives.length">
            <ul v-if="view === 'list'">
              <li
                v-for="objective in periodObjectives"
                :key="objective.id"
                class="itemHome__objectives--item"
              >
                <objective-row :objective="objective" :show-description="true" />

                <ul v-if="objective.keyResults.length">
                  <li
                    v-for="keyResult in objective.keyResults"
                    :key="keyResult.id"
                    class="keyResultRow"
                  >
                    <key-result-row :key-result="keyResult" />
                  </li>
                </ul>
              </li>
            </ul>

            <gantt-chart v-else :objectives="periodObjectives" :item="activeItem" />
          </template>

          <empty-state
            v-else
            :heading="$t('empty.noObjectivesInPeriod.heading')"
            :body="$t('empty.noObjectivesInPeriod.body')"
          >
            <div v-if="hasEditRights" data-mode="dark">
              <pkt-button
                :text="$t('empty.noObjectivesInPeriod.buttonText')"
                skin="primary"
                variant="icon-left"
                icon-name="plus-sign"
                @onClick="$router.push({ name: 'ItemAdmin', query: { tab: 'okr' } })"
              />
            </div>
          </empty-state>
        </template>
      </section>
    </template>
  </page-layout>

  <empty-page
    v-else
    :heading="$t('empty.noObjectives.heading')"
    :body="$t('empty.noObjectives.body')"
  >
    <div v-if="hasEditRights" data-mode="dark">
      <pkt-button
        :text="$t('empty.noObjectives.buttonText')"
        skin="primary"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="$router.push({ name: 'ItemAdmin', query: { tab: 'okr' } })"
      />
    </div>
  </empty-page>
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
    EmptyPage: () => import('@/components/pages/EmptyPage.vue'),
    PktButton: () => import('@oslokommune/punkt-vue2').then(({ PktButton }) => PktButton),
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
}

.itemHome__objectives--item {
  margin-bottom: 1rem;
  border: 2px solid var(--color-border);

  > ul {
    padding-bottom: 0.5rem;
  }
}
</style>
