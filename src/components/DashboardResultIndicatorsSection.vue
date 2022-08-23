<template>
  <div class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tabs-list
        :tabs="resultIndicators.map((resultIndicator) => resultIndicator.name)"
        :active-tab="activeTab"
        :set-active-tab="setActiveTab"
        aria-label="Velg resultatindikator"
      />
      <dashboard-period-selector
        :options="resultIndicatorPeriods"
        v-model="currentResultIndicatorPeriod"
      />
    </div>
    <tabs-panel :active-tab="activeTab">
      <svg ref="progressGraphSvg" />
    </tabs-panel>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { extent } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import endOfDay from 'date-fns/endOfDay';
import LineChart from '@/util/LineChart';
import IconChevronThinDown from './IconChevronThinDown.vue';
import DashboardPeriodSelector from './DashboardPeriodSelector.vue';
import TabsList from './TabsList.vue';
import TabsPanel from './TabsPanel.vue';
import firebase from 'firebase/app';

const Timestamp = firebase.firestore.Timestamp;

const getResultIndicatorPeriods = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const sixMonthsBack = new Date()
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);

  return {
    sixmonths: {
      label: 'Siste 6 mnd',
      key: 'sixmonths',
      startDate: sixMonthsBack,
      endDate: currentDate,
    },
    year: {
      label: 'Hittil i år',
      key: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate: endOfDay(new Date(currentYear, 11, 31)),
    },
  };
};

const RESULT_INDICATOR_PERIODS = getResultIndicatorPeriods();

export default {
  name: 'DashboardResultIndicatorsSection',

  components: {
    TabsList,
    TabsPanel,
    DashboardPeriodSelector,
  },

  data: () => ({
    activeTab: 0,
    resultIndicators: [],
    progressCollection: [],
    isPOCDepartment: false,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.sixmonths,
    selectComponents: { Deselect: null, OpenIndicator: IconChevronThinDown },
  }),

  computed: {
    ...mapState(['kpis']),
  },

  watch: {
    $route: {
      immediate: true,
      async handler(current) {
        const { resultIndicatorPeriod } = current.query;

        if (resultIndicatorPeriod) {
          this.currentResultIndicatorPeriod =
            RESULT_INDICATOR_PERIODS[resultIndicatorPeriod];
        }
      },
    },
    currentResultIndicatorPeriod() {
      this.getProgressData(this.resultIndicators[this.activeTab].id);

      if (this.$route.query?.resultIndicatorPeriod !== this.currentResultIndicatorPeriod.key) {
        this.$router.replace({
          query: { resultIndicatorPeriod: this.currentResultIndicatorPeriod.key },
        });
      }
    },
    kpis: {
      immediate: true,
      async handler(kpis) {
        this.resultIndicators = kpis;
        this.getProgressData();
      },
    },
    activeTab: {
      immediate: true,
      async handler() {
        this.getProgressData();
      },
    },
  },

  methods: {
    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },
    async getProgressData() {
      await this.$bind(
        'progressCollection',
        db
          .collection(
            `kpis/${this.resultIndicators[this.activeTab].id}/progress`
          )
          .where('timestamp', '>', this.currentResultIndicatorPeriod.startDate)
          .where('timestamp', '<', this.currentResultIndicatorPeriod.endDate)
          .orderBy('timestamp', 'desc')
      );

      this.renderGraph();
    },
    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg);
      }

      const [startValue, targetValue] = extent(
        this.progressCollection.map(({ value }) => value)
      );
      const startDate = Timestamp.fromDate(this.currentResultIndicatorPeriod.startDate);
      const endDate = Timestamp.fromDate(this.currentResultIndicatorPeriod.endDate);

      this.graph.render({
        obj: {
          startValue,
          targetValue,
        },
        period: {
          startDate,
          endDate,
        },
        progressionList: this.progressCollection,
        item: this.kpis[this.activeTab],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboardResultIndicatorsSection {
  padding: 1.5rem;
  background: var(--color-white);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    .title-3 {
      color: var(--color-text);
    }

    .v-select {
      min-width: 160px;
    }

    &::v-deep .vs__dropdown-toggle {
      .vs__open-indicator {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
}
</style>
