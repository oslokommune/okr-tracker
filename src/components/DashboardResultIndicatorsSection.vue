<template>
  <div class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tabs-list
        :tabs="resultIndicators.map((resultIndicator) => resultIndicator.name)"
        :active-tab="activeTab"
        :set-active-tab="setActiveTab"
        aria-label="Velg resultatindikator"
      />
      <div>
        <dashboard-period-selector
          :options="resultIndicatorPeriods"
          v-model="currentResultIndicatorPeriod"
        />
        <div class="dropdownButton">
          <v-select
            label="label"
            class="download"
            :value="downloadOption"
            :options="downloadOptions"
            :components="{ OpenIndicator, Deselect: null }"
            :closeOnSelect="true"
            @input="download"
          >
          </v-select>
        </div>
      </div>
    </div>
    <tabs-panel :active-tab="activeTab" ref="tabPanel">
      <!-- xmlns for download purposes -->
      <svg ref="progressGraphSvg" xmlns="http://www.w3.org/2000/svg" />
    </tabs-panel>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { extent } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import endOfDay from 'date-fns/endOfDay';
import { saveSvgAsPng } from 'save-svg-as-png';
import downloadFile from '@/util/downloadFile';
import LineChart from '@/util/LineChart';
import IconChevronThinDown from './IconChevronThinDown.vue';
import DashboardPeriodSelector from './DashboardPeriodSelector.vue';
import IconDownload from './IconDownload.vue';
import TabsList from './TabsList.vue';
import TabsPanel from './TabsPanel.vue';
import firebase from 'firebase/app';
import i18n from '@/locale/i18n';

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

  data: () => ({
    activeTab: 0,
    downloadOption: '',
    resultIndicators: [],
    progressCollection: [],
    isPOCDepartment: false,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.sixmonths,
    selectComponents: { Deselect: null, OpenIndicator: IconChevronThinDown },
    OpenIndicator: IconDownload,
    downloadOptions: [
      {
        label: `${i18n.t('dashboard.downloadOptions.svg')}`,
        downloadOption: 'svg',
      },
      {
        label: `${i18n.t('dashboard.downloadOptions.png')}`,
        downloadOption: 'png',
      },
    ],
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
    theme() {
      this.renderGraph();
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
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          height: 350,
        });
      }

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
        theme: this.theme,
      });
    },
    download(value) {
      const filename = this.resultIndicators[this.activeTab].name;
      const svgData = this.$refs.progressGraphSvg;

      if (value.downloadOption === 'png') {
        saveSvgAsPng(svgData, `${filename}.png`, {});
      }
      if (value.downloadOption === 'svg') {
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, svgData.outerHTML], {
          type: 'image/svg+xml;charset=utf-8',
        });

        downloadFile(svgBlob, filename, '.svg');
      }
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
      display: inline-block;
      width: min-content;
      min-width: 10rem;
    }

    &::v-deep .vs__dropdown-toggle {
      border-color: #f2f2f2;

      &:hover {
        background: var(--color-light-gray);
        border-color: #f2f2f2;
        cursor: pointer;
      }

      .vs__open-indicator {
        width: 1.5rem;
        height: 1.5rem;
      }

      .vs__search {
        padding: 0;
      }
    }

    &::v-deep .vs__dropdown-menu {
      border: 1px solid var(--color-light-gray);
    }

    .download {
      min-width: 1rem;

      &::v-deep .vs__dropdown-menu {
        position: center;
        left: -4rem;
        border: 1px solid #f2f2f2;
      }
    }

    .dropdownButton {
      display: inline;
      padding-left: 0.2rem;
      padding-right: 0.5rem;

      &::v-deep .vs--open .vs__open-indicator {
        transform: rotate(0deg) scale(1);
      }
    }
  }
}
</style>
