<template>
  <div class="dashboardResultIndicatorsSection">
    <div class="dashboardResultIndicatorsSection__header">
      <tab-list
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
          v-model="currentResultIndicatorPeriod"
          :options="resultIndicatorPeriods"
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
      <div
        v-if="latestProgressRecord && resultIndicatorTarget"
        class="progressTarget"
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
    </tab-panel>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { extent } from 'd3-array';
import { csvFormatBody, csvFormatRow } from 'd3-dsv';
import firebase from 'firebase/app';
import { saveSvgAsPng } from 'save-svg-as-png';

import { db } from '@/config/firebaseConfig';
import kpiTypes from '@/config/kpiTypes';
import downloadFile from '@/util/downloadFile';
import LineChart from '@/util/LineChart';
import tabIdsHelper from '@/util/tabUtils';
import { numberLocale } from '@/util';
import i18n from '@/locale/i18n';
import {
  APEN_BY_RESULT_INDICATORS,
  KPI_TARGETS,
} from '@/views/Dashboard/data/staticData';
import IconChevronThinDown from './IconChevronThinDown.vue';
import DashboardPeriodSelector from './DashboardPeriodSelector.vue';
import IconDownload from './IconDownload.vue';
import TabList from './TabList.vue';
import TabPanel from './TabPanel.vue';

const { Timestamp } = firebase.firestore;

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
  },

  props: {
    isPOCDepartment: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
    activeTab: 0,
    downloadOption: '',
    resultIndicators: [],
    progressCollection: [],
    latestProgressRecord: 0,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.sixmonths,
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
    ...mapState(['kpis']),
    resultIndicatorTarget() {
      const resultIndicator = this.resultIndicators[this.activeTab];
      return KPI_TARGETS[resultIndicator.id];
    },
    tabIds() {
      return tabIdsHelper('resultIndicator');
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
        this.latestProgressRecord = null;

        this.getProgressData();
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
      if (this.isPOCDepartment && this.activeTab > this.kpis.length - 1) {
        this.latestProgressRecord =
          this.progressCollection[this.progressCollection.length - 1];
      } else {
        await db
          .collection(
            `kpis/${this.resultIndicators[this.activeTab].id}/progress`
          )
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
    download(value) {
      const filename = this.resultIndicators[this.activeTab].name;
      const svgData = this.$refs.progressGraphSvg;

      if (value.downloadOption === 'png') {
        const svgFrame = svgData.getBoundingClientRect();

        const options = {
          width: svgFrame.width + 50,
          height: svgFrame.height,
        };
        saveSvgAsPng(svgData, `${filename}.png`, options);
      } else if (value.downloadOption === 'csv') {
        const content = [
          csvFormatRow([
            i18n.t('fields.value'),
            i18n.t('fields.date'),
            i18n.t('fields.comment'),
          ]),
          csvFormatBody(
            this.progressCollection.map((d) => {
              return [d.value, d.timestamp.toDate().toISOString(), d.comment];
            })
          ),
        ].join('\n');
        downloadFile(content, filename, '.csv');
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
      margin-left: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .download {
      min-width: 1rem;

      &::v-deep .vs__dropdown-menu {
        left: -3.6rem;
        border: 1px solid var(--color-grey-100);
      }
    }

    .dropdownButton {
      display: inline-block;
      padding-left: 0.2rem;
      padding-right: 0.5rem;

      &::v-deep .vs--open .vs__open-indicator {
        transform: rotate(0deg) scale(1);
      }
    }
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
