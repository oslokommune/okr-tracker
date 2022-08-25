<template>
  <div class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tabs-list
        :tabs="
          this.resultIndicators.map((resultIndicator) => ({
            label: resultIndicator.name,
            tooltip: resultIndicator.description,
          }))
        "
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
      <svg class="progressGraph" ref="progressGraphSvg" />
      <div
        class="progressTarget"
        v-if="latestProgressRecord && resultIndicatorTarget"
      >
        <div>
          <span class="progressTarget__title">{{
            $t('kpi.currentValue')
          }}</span>
          <span class="progressTarget__value">{{
            formatResultIndicatorValue(latestProgressRecord.value)
          }}</span>
        </div>
        <div>
          <span class="progressTarget__title">{{
            resultIndicatorTarget.name[$i18n.locale]
          }}</span>
          <span class="progressTarget__value">{{
            formatResultIndicatorValue(resultIndicatorTarget.value)
          }}</span>
        </div>
      </div>
    </tabs-panel>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { extent } from 'd3-array';
import firebase from 'firebase/app';
import { db } from '@/config/firebaseConfig';
import endOfDay from 'date-fns/endOfDay';
import LineChart from '@/util/LineChart';
import { numberLocale } from '@/util';
import kpiTypes from '@/config/kpiTypes';
import IconChevronThinDown from './IconChevronThinDown.vue';
import DashboardPeriodSelector from './DashboardPeriodSelector.vue';
import TabsList from './TabsList.vue';
import TabsPanel from './TabsPanel.vue';
import {
  APEN_BY_RESULT_INDICATORS,
  KPI_TARGETS,
} from '@/views/Dashboard/data/staticData';

const Timestamp = firebase.firestore.Timestamp;

const getResultIndicatorPeriods = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const sixMonthsBack = new Date();
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

  props: {
    isPOCDepartment: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
    activeTab: 0,
    resultIndicators: [],
    progressCollection: [],
    latestProgressRecord: 0,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.sixmonths,
    selectComponents: { Deselect: null, OpenIndicator: IconChevronThinDown },
  }),

  computed: {
    ...mapState(['kpis']),
    resultIndicatorTarget() {
      const resultIndicator = this.resultIndicators[this.activeTab];
      return KPI_TARGETS[resultIndicator.id];
    },
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
      this.getProgressData();

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
    kpis: {
      immediate: true,
      async handler(kpis) {
        this.resultIndicators = [
          ...kpis,
          ...(this.isPOCDepartment ? APEN_BY_RESULT_INDICATORS : []),
        ];
        this.getProgressData();
      },
    },
    activeTab: {
      immediate: true,
      async handler(activeTab) {
        this.getProgressData();
        this.getLatestProgressRecord();
      },
    },
  },

  methods: {
    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },
    async getLatestProgressRecord() {
      this.latestProgressRecord = null;
      await db
        .collection(`kpis/${this.resultIndicators[this.activeTab].id}/progress`)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get()
        .then((list) => {
          this.latestProgressRecord = list.docs[0] ? list.docs[0].data() : null;
        });
    },
    async getProgressData() {
      if (this.isPOCDepartment && this.activeTab > this.kpis.length - 1) {
        this.progressCollection =
          this.resultIndicators[this.activeTab].progression;
      } else {
        await this.$bind(
          'progressCollection',
          db
            .collection(
              `kpis/${this.resultIndicators[this.activeTab].id}/progress`
            )
            .where(
              'timestamp',
              '>',
              this.currentResultIndicatorPeriod.startDate
            )
            .where('timestamp', '<', this.currentResultIndicatorPeriod.endDate)
            .orderBy('timestamp', 'desc')
        );
      }

      this.renderGraph();
    },
    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          height: 350,
        });
      }

      if (this.progressCollection.length === 0) return;

      const [startValue, targetValue] = extent(
        this.progressCollection.map(({ value }) => value)
      );
      const startDate = Timestamp.fromDate(
        this.currentResultIndicatorPeriod.startDate
      );
      const endDate = Timestamp.fromDate(
        this.currentResultIndicatorPeriod.endDate
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
      });
    },
    formatResultIndicatorValue(value) {
      const resultIndicator = this.resultIndicators[this.activeTab];
      if (resultIndicator && value) {
        if (resultIndicator.type === 'users') {
          return numberLocale.format(',')(value);
        }
        return kpiTypes[resultIndicator.type].formatValue(value);
      }
      return null;
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
  }
}

.progressGraph {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
}

.progressTarget {
  display: flex;
  gap: 2rem;
  border-top: 1px solid var(--color-grey-100);
  margin-top: 0.5rem;
  padding: 1.5rem;

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
    font-weight: 500;
    color: var(--color-text);
  }
}
</style>
