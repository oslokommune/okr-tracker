<template>
  <div class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tabs-list
        :tabs="resultIndicators.map((resultIndicator) => resultIndicator.name)"
        :active-tab="activeTab"
        :set-active-tab="setActiveTab"
        aria-label="Velg resultatindikator"
      />
      <v-select
        label="name"
        :options="resultIndicatorPeriods"
        :value="currentResultIndicatorPeriod"
        :components="selectComponents"
        :searchable="false"
        @input="setCurrentResultIndicatorPeriod"
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
import LineChart from '@/util/LineChart';
import IconChevronThinDown from './IconChevronThinDown.vue';
import TabsList from './TabsList.vue';
import TabsPanel from './TabsPanel.vue';

const getResultIndicatorPeriods = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return {
    quarter: {
      name: '1. kvartal',
      value: 'quarter',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 2, 31),
    },
    tertial: {
      name: 'tertial',
      value: 'tertial',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 3, 30),
    },
    year: {
      name: 'hittil i år',
      value: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate: currentDate,
    },
  };
};

const RESULT_INDICATOR_PERIODS = getResultIndicatorPeriods();

export default {
  name: 'DashboardResultIndicatorsSection',

  components: {
    TabsList,
    TabsPanel,
  },

  data: () => ({
    activeTab: 0,
    resultIndicators: [],
    progressCollection: [],
    isPOCDepartment: false,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.quarter,
    selectComponents: { Deselect: null, OpenIndicator: IconChevronThinDown },
  }),

  computed: {
    ...mapState(['kpis', 'theme']),
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
    progressCollection() {
      this.renderGraph();
    },
  },

  methods: {
    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },
    async getProgressData() {
      const collection = db
        .collection(`kpis/${this.resultIndicators[this.activeTab].id}/progress`)
        .where('timestamp', '>', this.currentResultIndicatorPeriod.startDate)
        .where('timestamp', '<', this.currentResultIndicatorPeriod.endDate)
        .orderBy('timestamp', 'desc');

      await this.$bind('progressCollection', collection);
    },
    setCurrentResultIndicatorPeriod(selectedPeriod) {
      this.currentResultIndicatorPeriod = selectedPeriod;
      this.$router.push({
        query: { resultIndicatorPeriod: selectedPeriod.value },
      });
    },
    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          colorMode: this.theme,
        });
      }

      const [startValue, targetValue] = extent(
        this.progressCollection.map(({ value }) => value)
      );
      const [startDate, endDate] = extent(
        this.progressCollection.map(({ timestamp }) => timestamp)
      );

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
        theme: this.theme,
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
    justify-content: space-between;

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
