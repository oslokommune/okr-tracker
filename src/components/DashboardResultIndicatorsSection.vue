<template>
  <div v-if="resultIndicators.length" class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tab-list
        ref="tabList"
        aria-label="Velg resultatindikator"
        :tabs="
          resultIndicators.map((resultIndicator) => ({
            tabName: resultIndicator.name,
            tooltip: {
              content: resultIndicator.description,
              placement: 'bottom',
            },
          }))
        "
        :active-tab="activeTab"
        :set-active-tab="setActiveTab"
        :tab-ids="tabIds"
        :is-filled="false"
      />
      <div class="graphOptions">
        <dashboard-period-selector
          :options="resultIndicatorPeriods"
          :start-date="startDate"
          :end-date="endDate"
          :period="currentResultIndicatorPeriod"
          @input="setPeriod($event)"
        />
        <div class="dropdownButton">
          <v-select
            label="label"
            class="download"
            :value="downloadOption"
            :options="downloadOptions"
            :components="{ OpenIndicator, Deselect: null }"
            :close-on-select="true"
            @input="download"
          >
          </v-select>
        </div>
      </div>
    </div>
    <tab-panel :active-tab="activeTab" :tab-ids="tabIds">
      <!-- xmlns for download purposes -->
      <svg
        ref="progressGraphSvg"
        class="progressGraph"
        xmlns="http://www.w3.org/2000/svg"
      />
      <div class="progressTarget">
        <div>
          <span class="progressTarget__title">{{
            $t('kpi.currentValue')
          }}</span>
          <span v-if="latestProgressRecord" class="progressTarget__value">
            {{ formatResultIndicatorValue(latestProgressRecord.value) }}
          </span>
        </div>
        <div v-if="goal">
          <span class="progressTarget__title">{{ $t('kpi.goals.for') }} {{ goal.name }}</span>
          <span class="progressTarget__value">{{ goal.value }}</span>
        </div>
      </div>
    </tab-panel>
  </div>
  <empty-state
    v-else
    :icon="'exclamation'"
    :heading="$t('empty.noResultIndicators.heading')"
    :body="$t('empty.noResultIndicators.body')"
  >
    <router-link
      v-if="hasEditRights"
      :to="{ name: 'ItemAdmin', query: { tab: 'kpi' } }"
      class="btn btn--ter"
    >
      {{ $t('empty.noResultIndicators.linkText') }}
    </router-link>
  </empty-state>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { max, min } from 'd3-array';
import { csvFormatBody, csvFormatRow } from 'd3-dsv';
import firebase from 'firebase/app';

import { db } from '@/config/firebaseConfig';
import { periodDates } from '@/util';
import { formatKPIValue, kpiInterval } from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import downloadPng from '@/util/downloadPng';
import LineChart from '@/util/LineChart';
import tabIdsHelper from '@/util/tabUtils';
import i18n from '@/locale/i18n';
import IconChevronThinDown from './IconChevronThinDown.vue';
import DashboardPeriodSelector from './DashboardPeriodSelector.vue';
import IconDownload from './IconDownload.vue';
import TabList from './TabList.vue';
import TabPanel from './TabPanel.vue';
import EmptyState from './EmptyState.vue';

const { Timestamp } = firebase.firestore;

const getResultIndicatorPeriods = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const sixMonthsBack = new Date();
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);

  return {
    sixmonths: {
      label: i18n.t('period.sixmonths'),
      key: 'sixmonths',
      startDate: sixMonthsBack,
      endDate: currentDate,
    },
    year: {
      label: i18n.t('period.year'),
      key: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate: currentDate,
    },
    all: {
      label: i18n.t('period.all'),
      key: 'all',
      startDate: false,
      endDate: currentDate,
    },
  };
};

const RESULT_INDICATOR_PERIODS = getResultIndicatorPeriods();

export default {
  name: 'DashboardResultIndicatorsSection',

  components: {
    TabList,
    TabPanel,
    DashboardPeriodSelector,
    EmptyState,
  },

  data: () => ({
    activeTab: 0,
    downloadOption: '',
    progressCollection: [],
    goal: null,
    latestProgressRecord: 0,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.sixmonths,
    startDate: null,
    endDate: null,
    selectComponents: { Deselect: null, OpenIndicator: IconChevronThinDown },
    OpenIndicator: IconDownload,
    downloadOptions: [
      {
        label: i18n.t('dashboard.downloadOptions.png'),
        downloadOption: 'png',
      },
      {
        label: i18n.t('dashboard.downloadOptions.csv'),
        downloadOption: 'csv',
      },
    ],
  }),

  computed: {
    ...mapState(['kpis', 'subKpis', 'theme']),
    ...mapGetters(['hasEditRights']),
    tabIds() {
      return tabIdsHelper('resultIndicator');
    },
    resultIndicators() {
      return [
        ...this.kpis.filter((kpi) => kpi.kpiType === 'ri'),
        ...this.subKpis.filter((kpi) => kpi.kpiType === 'ri'),
      ];
    },
    filteredProgress() {
      // Filter out any duplicate measurement values for each date
      const seenDates = [];

      return this.progressCollection.filter((a) => {
        const date = a.timestamp.toDate().toISOString().slice(0, 10);
        if (!seenDates.includes(date)) {
          seenDates.push(date);
          return true;
        }
        return false;
      });
    },
  },

  watch: {
    $route: {
      immediate: true,
      async handler(current) {
        const { resultIndicatorPeriod } = current.query;

        if (resultIndicatorPeriod) {
          if (
            Object.hasOwnProperty.call(
              RESULT_INDICATOR_PERIODS,
              resultIndicatorPeriod
            )
          ) {
            this.currentResultIndicatorPeriod =
              RESULT_INDICATOR_PERIODS[resultIndicatorPeriod];
          } else {
            this.$router.replace({ query: null });
          }
        }
      },
    },
    currentResultIndicatorPeriod() {
      this.getProgressData().then(this.renderGraph);

      if (
        this.$route.query?.resultIndicatorPeriod !==
        this.currentResultIndicatorPeriod.key
      ) {
        this.$router.replace({
          query: {
            resultIndicatorPeriod: this.currentResultIndicatorPeriod.key,
          },
        });
      }
    },
    resultIndicators: {
      immediate: true,
      async handler() {
        this.getProgressData().then(this.renderGraph);
      },
    },
    activeTab: {
      immediate: true,
      async handler() {
        this.latestProgressRecord = null;
        this.getProgressData().then(this.renderGraph);
        this.getGoal().then((goal) => this.goal = goal);
      },
    },
    progressCollection: {
      immediate: true,
      async handler() {
        this.getLatestProgressRecord();
      },
    },
    theme() {
      this.renderGraph();
    },
  },

  methods: {
    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },
    async getLatestProgressRecord() {
      const ri = this.getActiveRI();

      if (ri) {
        await db
          .collection(`kpis/${ri.id}/progress`)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get()
          .then((list) => {
            this.latestProgressRecord = list.docs[0]
              ? list.docs[0].data()
              : null;
          });
      }
    },
    async getProgressData() {
      const ri = this.getActiveRI();

      if (ri) {
        let query = db.collection(`kpis/${ri.id}/progress`);

        if (this.currentResultIndicatorPeriod.startDate) {
          query = query.where(
            'timestamp', '>=', this.currentResultIndicatorPeriod.startDate
          );
        }

        if (this.currentResultIndicatorPeriod.endDate) {
          query = query.where(
            'timestamp', '<=', this.currentResultIndicatorPeriod.endDate
          );
        }

        await this.$bind(
          'progressCollection',
          query.orderBy('timestamp', 'desc')
        );

        if (
          this.currentResultIndicatorPeriod?.key === 'all' &&
          !this.progressCollection.length
        ) {
          // Return dates for all year if it's not possible to identify a start
          // or end date due to missing progress data in the current collection.
          this.startDate = RESULT_INDICATOR_PERIODS.year.startDate;
          this.endDate = RESULT_INDICATOR_PERIODS.year.endDate;
          return;
        }

        this.startDate = this.getStartDate(
          this.currentResultIndicatorPeriod,
          this.progressCollection
        );

        this.endDate = this.getEndDate(
          this.currentResultIndicatorPeriod,
          this.progressCollection
        );
      }
    },

    /**
     * Return a current goal for the active RI if any, else return
     * null.
     */
    async getGoal() {
      const ri = this.getActiveRI();
      const now = new Date();

      let goals = await db.collection(`kpis/${ri.id}/goals`)
          .where('toDate', '>', now)
          .orderBy('toDate')
          .get();

      // Firebase doesn't support equality filtering on more than one field at a
      // time, so do the rest of the filtering client side.
      goals = goals.docs.filter((goal) => goal.get('fromDate').toDate() < now);

      // We don't enforce non-overlapping goals (yet?), but if anyone has set
      // overlapping goals, just pick the one with the closest end date.
      return goals.length ? goals[0].data() : null;
    },

    /**
     * Return the start date of `period`. If unset, the earliest date
     * found in `progress` is returned instead.
     */
    getStartDate(period, progress) {
      if (period.startDate) {
        const ts = Timestamp.fromDate(period.startDate);
        return ts.toDate ? ts.toDate() : new Date(period.ts);
      }

      return min(progress, d => d.timestamp).toDate();
    },

    /**
     * Return the end date of `period`. If unset, the last date found in
     * `progress` is returned instead.
     */
    getEndDate(period, progress) {
      if (period.endDate) {
        const ts = Timestamp.fromDate(period.endDate);
        return ts.toDate ? ts.toDate() : new Date(ts);
      }

      return max(progress, d => d.timestamp).toDate();
    },

    renderGraph() {
      if (!this.resultIndicators.length) return;

      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          height: 550,
          legend: true,
          tooltips: true,
        });
      }

      const kpi = this.resultIndicators[this.activeTab];
      const [startValue, targetValue] = kpiInterval(kpi.format);

      this.graph.render({
        startDate: this.startDate,
        endDate: this.endDate,
        progress: this.filteredProgress,
        kpi,
        startValue,
        targetValue,
        theme: this.theme,
      });
    },

    getActiveRI () {
      return this.resultIndicators.length
        ? this.resultIndicators[this.activeTab]
        : null;
    },

    formatResultIndicatorValue(value) {
      const resultIndicator = this.getActiveRI();
      return resultIndicator && value
        ? formatKPIValue(resultIndicator, value)
        : null;
    },
    download(value) {
      const filename = this.getActiveRI().name;

      if (value.downloadOption === 'png') {
        const svgRef = this.$refs.progressGraphSvg;
        const activeTabName = this.$refs.tabList.$el.querySelector(
          `#resultIndicatorTabButton-${this.activeTab}`
        )?.innerText;
        const formattedPeriod = periodDates({
          startDate: this.getStartDate(
            this.currentResultIndicatorPeriod,
            this.filteredProgress
          ),
          endDate: this.getEndDate(
            this.currentResultIndicatorPeriod,
            this.filteredProgress
          ),
        });

        downloadPng(
          svgRef,
          filename,
          activeTabName,
          formattedPeriod,
          this.theme
        );
      } else if (value.downloadOption === 'csv') {
        const content = [
          csvFormatRow([
            i18n.t('fields.value'),
            i18n.t('fields.date'),
            i18n.t('fields.comment'),
          ]),
          csvFormatBody(
            this.filteredProgress.map((d) => [
              d.value,
              d.timestamp.toDate().toISOString(),
              d.comment,
            ])
          ),
        ].join('\n');
        downloadFile(content, filename, '.csv');
      }
    },

    setPeriod (period) {
      if (this.startDate.getTime?.() !== period.startDate.getTime?.()
          || this.endDate.getTime?.() !== period.endDate.getTime?.()) {
        this.currentResultIndicatorPeriod = period;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboardResultIndicatorsSection {
  background: var(--color-white);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    border-bottom: 1px solid var(--color-grey-100);

    .title-3 {
      color: var(--color-text);
    }

    .v-select {
      display: inline-flex;
    }

    &::v-deep .vs__dropdown-toggle {
      border-color: var(--color-grey-100);

      &:hover {
        background: var(--color-light-gray);
        border-color: var(--color-light-gray);
        cursor: pointer;
      }

      .vs__open-indicator {
        width: 1.4rem;
        height: 1.4rem;
        margin: 0.15rem 0.4rem 0.3rem 0.2rem;
        padding: 0rem;
      }

      .vs__search {
        padding: 0rem;
      }
    }

    &::v-deep .vs__dropdown-menu {
      border: 1px solid var(--color-grey-100);
    }

    .graphOptions {
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
      margin-left: 1rem;
    }

    .download {
      min-width: 1rem;
      height: 100%;
      margin-right: 0.5rem;

      &::v-deep .vs__dropdown-menu {
        left: -3.6rem;
        border: 1px solid var(--color-grey-100);
      }
    }

    .dropdownButton {
      display: inline-block;

      &::v-deep .vs--open .vs__open-indicator {
        transform: rotate(0deg) scale(1);
      }
    }
  }
}

.progressGraph {
  padding: 1rem 1.5rem 0 0.25rem;
}

.progressTarget {
  display: flex;
  gap: 2rem;
  min-height: 5.7rem;
  margin-top: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-grey-100);

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  &__title {
    color: var(--color-grey-600);
    font-size: 14px;
  }
  &__value {
    color: var(--color-text);
    font-weight: 500;
  }
}
</style>
