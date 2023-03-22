<template>
  <div class="container">
    <main class="main">
      <header>
        <h2 class="title-1">{{ $t('general.OKRsLong') }}</h2>
      </header>

      <section>
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
          <action-bar v-else-if="periodObjectives.length" />
          <content-loader-item v-if="dataLoading"></content-loader-item>
          <empty-state
            v-else-if="!periodObjectives.length && !dataLoading"
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
          <ul v-if="periodObjectives.length && !dataLoading">
            <li
              v-for="objective in periodObjectives"
              :key="objective.id"
              class="itemHome__objectives--item"
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

    <aside v-if="activeItem" class="aside widgets">
      <widget
        v-if="activePeriod && activePeriod.progression"
        :title="$t(`widget.progression.period`)"
        size="small"
      >
        <progression-chart :progression="activePeriod.progression" />
      </widget>
      <widget-weights type="objective" :active-item="activePeriod" :items="objectives" />
    </aside>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { isBefore, addDays, isWithinInterval } from 'date-fns';
import objectiveInPeriod from '@/util/okr';
import tabIdsHelper from '@/util/tabUtils';
import { periodDates } from '@/util';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from '@/components/ContentLoader/ContentLoaderActionBar.vue';
import TabList from '@/components/TabList.vue';
import TabPanel from '@/components/TabPanel.vue';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import ProgressionChart from '@/components/ProgressionChart.vue';

export default {
  name: 'ItemHome',

  components: {
    ActionBar: () => import('@/components/ActionBar.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    Widget: WidgetWrapper,
    WidgetWeights,
    ProgressionChart,
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
      'activePeriod',
      'dataLoading',
      'keyResults',
      'objectives',
      'periods',
      'user',
    ]),
    ...mapGetters(['hasEditRights']),

    isCompact() {
      return this.user.preferences.view === 'compact';
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

    periodObjectives() {
      if (!this.activePeriod) {
        return [];
      }

      return this.objectives
        .filter((o) => objectiveInPeriod(this.activePeriod, o))
        .map((o) => ({
          ...o,
          id: o.id,
          keyResults: this.keyResults.filter(
            (kr) => kr.objective === `objectives/${o.id}`
          ),
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

.itemHome__objectives--item {
  margin-bottom: 1rem;
  background: var(--color-white);

  > ul {
    padding-bottom: 0.5rem;
  }
}
</style>
