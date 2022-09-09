<template>
  <div class="container">
    <div class="widgets--left">
      <widgets-left class="aside--left"></widgets-left>
    </div>

    <div class="main">
      <div class="main__item">
        <kpis v-if="kpis.length" :kpis="kpis"></kpis>

        <div class="itemHome__header">
          <h2 class="title-2">{{ $t('general.OKRsLong') }}</h2>
          <tab-list
            aria-label="Velg periode"
            :tabs="tabs"
            :active-tab="activeTab"
            :set-active-tab="handleTabChange"
            :tab-ids="tabIds"
          />
        </div>

        <tab-panel :active-tab="activeTab" :tab-ids="tabIds">
          <content-loader-action-bar
            v-if="dataLoading"
            class="itemHome__header--content-loader"
          ></content-loader-action-bar>
          <action-bar v-else-if="tree.length" />
          <content-loader-item v-if="dataLoading"></content-loader-item>
          <empty-state
            v-else-if="!tree.length && !dataLoading"
            :icon="'exclamation'"
            :heading="$t('empty.noPeriods.heading')"
            :body="$t('empty.noPeriods.body')"
          >
            <router-link
              v-if="hasEditRights"
              class="btn btn--ter"
              :to="{ name: 'ItemAdmin', tab: 'okr' }"
            >
              {{ $t('empty.noPeriods.buttonText') }}
            </router-link>
          </empty-state>
          <ul v-if="tree && !dataLoading">
            <li
              v-for="objective in tree"
              :key="objective.id"
              class="itemHome__tree--item"
            >
              <objective-row :objective="objective"></objective-row>
              <ul v-if="objective.keyResults">
                <li
                  v-for="keyResult in objective.keyResults"
                  :key="keyResult.id"
                  class="keyResultRow"
                  :class="{ 'keyResultRow--isCompact': isCompact }"
                >
                  <key-result-row :key-result="keyResult"></key-result-row>
                </li>
              </ul>
            </li>
          </ul>
        </tab-panel>
      </div>
    </div>

    <widgets-right class="aside--right" />

    <widgets-mobile class="aside--bottom" />
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { isBefore, addDays } from 'date-fns';
import tabIdsHelper from '@/util/tabUtils';
import { periodDates } from '@/util';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from '@/components/ContentLoader/ContentLoaderActionBar.vue';
import WidgetsMobile from '@/components/widgets/WidgetsMobile.vue';
import TabList from '@/components/TabList.vue';
import TabPanel from '@/components/TabPanel.vue';

export default {
  name: 'ItemHome',

  components: {
    WidgetsMobile,
    ActionBar: () => import('@/components/ActionBar.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    WidgetsRight: () => import('@/components/widgets/WidgetsItemHomeRight.vue'),
    Kpis: () => import('@/components/KPIs.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    ContentLoaderItem,
    ContentLoaderActionBar,
    TabPanel,
    TabList,
  },

  data: () => ({
    activeTab: 0,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'objectives',
      'keyResults',
      'kpis',
      'dataLoading',
      'user',
      'periods',
      'activePeriod',
    ]),
    ...mapGetters(['hasEditRights']),

    isCompact() {
      return this.user.preferences.view === 'compact';
    },

    tree() {
      return this.objectives.reduce(
        (acc, objective) => [
          ...acc,
          {
            ...objective,
            id: objective.id,
            keyResults: this.keyResults.filter(
              (keyRes) => keyRes.objective === `objectives/${objective.id}`
            ),
          },
        ],
        []
      );
    },
    tabIds() {
      return tabIdsHelper('periods');
    },
    filteredPeriods() {
      if (this.hasEditRights) return this.periods;
      const daysInAdvance = 7; // Prior to period start

      return this.periods.filter(({ startDate }) =>
        isBefore(startDate.toDate(), addDays(new Date(), daysInAdvance))
      );
    },

    tabs() {
      return this.filteredPeriods.map((period) => ({
        tabName: period.name,
        tooltip: periodDates(period),
      }));
    },
  },

  created() {
    if (this.filteredPeriods.length > 0) {
      this.set_active_period_and_data(this.filteredPeriods[0].id);
    }
  },

  methods: {
    ...mapActions(['set_active_period_and_data', 'setDataLoading']),

    getInitialActiveTab() {},

    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },

    async setPeriod(tabIndex) {
      try {
        const activePeriodId = this.filteredPeriods[tabIndex].id;

        await this.setDataLoading(true);
        await this.set_active_period_and_data(activePeriodId);
      } catch (e) {
        console.log(e);
      } finally {
        await this.setDataLoading(false);
      }
    },

    periodDates,

    async handleTabChange(tabIndex) {
      await this.setPeriod(tabIndex);
      this.setActiveTab(tabIndex);
    },
  },
};
</script>

<style lang="scss" scoped>
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

.itemHome__tree--item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
