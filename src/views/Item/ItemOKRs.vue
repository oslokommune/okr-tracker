<template>
  <div class="container">
    <main class="main">
      <section>
        <h2 class="title-1">{{ $t('general.OKRsLong') }}</h2>
        <tab-list
          aria-label="Velg periode"
          :tabs="tabs"
          :active-tab="activeTab"
          :set-active-tab="handleTabChange"
          :tab-ids="tabIds"
        />

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
              :to="{ name: 'ItemAdmin', query: { tab: 'okr' } }"
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
              <ul v-if="objective.keyResults.length">
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
      </section>
    </main>

    <widgets-right class="aside" />
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { isBefore, addDays, isWithinInterval } from 'date-fns';
import tabIdsHelper from '@/util/tabUtils';
import { periodDates } from '@/util';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from '@/components/ContentLoader/ContentLoaderActionBar.vue';
import TabList from '@/components/TabList.vue';
import TabPanel from '@/components/TabPanel.vue';

export default {
  name: 'ItemHome',

  components: {
    ActionBar: () => import('@/components/ActionBar.vue'),
    WidgetsRight: () => import('@/components/widgets/WidgetsItemHomeRight.vue'),
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
      if (this.hasEditRights) {
        return this.periods;
      }
      const daysInAdvance = 7; // Prior to period start

      return this.periods.filter(({ startDate }) =>
        isBefore(startDate.toDate(), addDays(new Date(), daysInAdvance))
      );
    },

    tabs() {
      return this.filteredPeriods.map((period) => ({
        tabName: period.name,
        tooltip: { content: periodDates(period) },
      }));
    },
  },

  created() {
    if (this.filteredPeriods.length > 0) {
      const defaultPeriodIndex = this.getCurrentPeriodIndex() || 0;
      this.setPeriod(this.filteredPeriods[defaultPeriodIndex].id);
      this.setActiveTab(defaultPeriodIndex);
    }
  },

  methods: {
    ...mapActions(['set_active_period_and_data', 'setDataLoading']),

    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },

    async setPeriod(activePeriodId) {
      try {
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
      const activePeriodId = this.filteredPeriods[tabIndex].id;
      await this.setPeriod(activePeriodId);
      this.setActiveTab(tabIndex);
    },

    getCurrentPeriodIndex() {
      const now = new Date();

      for (const [index, period] of this.filteredPeriods.entries()) {
        if (
          period.startDate &&
          period.endDate &&
          isWithinInterval(now, {
            start: period.startDate.toDate(),
            end: period.endDate.toDate(),
          })
        ) {
          return index;
        }
      }
      return null;
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
  background: var(--color-white);

  > ul {
    padding-bottom: 0.5rem;
  }
}
</style>
