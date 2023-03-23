<template>
  <widget :title="$t('kpi.progress')">
    <div class="dropdownButton">
      <v-select
        label="label"
        class="download"
        :value="downloadOption"
        :options="downloadOptions"
        :components="{ OpenIndicator: downloadIcon, Deselect: null }"
        :close-on-select="true"
        @input="download"
      >
      </v-select>
    </div>

    <!-- xmlns for download purposes -->
    <svg
      ref="progressGraphSvg"
      class="progressGraph"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { max, min } from 'd3-array';
import { csvFormatBody, csvFormatRow } from 'd3-dsv';
import firebase from 'firebase/app';
import { PktIcon } from '@oslokommune/punkt-vue2';
import { periodDates } from '@/util';
import { kpiInterval } from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import downloadPng from '@/util/downloadPng';
import LineChart from '@/util/LineChart';
import i18n from '@/locale/i18n';
import getPeriods from '@/config/periods';
import WidgetWrapper from './WidgetWrapper.vue';

const { Timestamp } = firebase.firestore;

export default {
  name: 'WidgetKpiProgressGraph',

  components: {
    Widget: WidgetWrapper,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    progress: {
      type: Array,
      required: true,
    },
    goals: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  data: () => ({
    graph: null,
    downloadOption: '',
    startDate: null,
    endDate: null,
    downloadIcon: {
      render: (createElement) => createElement(PktIcon, { props: { name: 'download' } }),
    },
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
    ...mapState(['selectedPeriod']),
  },

  watch: {
    progress: {
      immediate: false,
      handler: 'renderGraph',
    },
    goals: {
      immediate: false,
      handler: 'renderGraph',
    },
  },

  mounted() {
    this.renderGraph();
  },

  methods: {
    setStartAndEndDates() {
      if (this.selectedPeriod?.key === 'all' && !this.progress.length) {
        // Return dates for all year if it's not possible to identify a start
        // or end date due to missing progress data in the current collection.
        const { startDate, endDate } = getPeriods().year;
        this.startDate = startDate;
        this.endDate = endDate;
        return;
      }

      this.startDate = this.getStartDate(this.selectedPeriod, this.progress);
      this.endDate = this.getEndDate(this.selectedPeriod, this.progress);
    },

    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          height: 550,
          legend: true,
          tooltips: true,
        });
      }

      this.setStartAndEndDates();

      const kpi = this.kpi;
      const [startValue, targetValue] = kpiInterval(kpi.format);

      this.graph.render({
        startDate: this.startDate,
        endDate: this.endDate,
        progress: this.progress,
        targets: this.goals
          .map((g) => ({
            startDate: g.fromDate.toDate(),
            endDate: g.toDate.toDate(),
            value: parseFloat(g.value),
          }))
          .filter((g) => g.endDate >= this.startDate && g.startDate <= this.endDate),
        kpi,
        startValue,
        targetValue,
      });
    },

    download(value) {
      const kpiName = this.kpi.name;

      if (value.downloadOption === 'png') {
        const svgRef = this.$refs.progressGraphSvg;
        const formattedPeriod = periodDates({
          startDate: this.getStartDate(this.selectedPeriod, this.progress),
          endDate: this.getEndDate(this.selectedPeriod, this.progress),
        });

        downloadPng(svgRef, kpiName, kpiName, formattedPeriod);
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
        downloadFile(content, kpiName, '.csv');
      }
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

      return min(progress, (d) => d.timestamp.toDate());
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

      return max(progress, (d) => d.timestamp.toDate());
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

::v-deep .widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.v-select {
  display: inline-flex;
}

::v-deep .vs__dropdown-toggle {
  border-color: var(--color-grayscale-10);

  &:hover {
    background: var(--color-gray-light);
    border-color: var(--color-gray-light);
    cursor: pointer;
  }

  .vs__open-indicator {
    height: 1.25rem;
    margin: 0.15rem 0.4rem 0.3rem 0.2rem;
    padding: 0rem;
  }

  .vs__search {
    padding: 0rem;
  }
}

::v-deep .vs__dropdown-menu {
  border: 1px solid var(--color-grayscale-10);
}

.download {
  min-width: 1rem;
  height: 100%;

  &::v-deep .vs__dropdown-menu {
    left: -3.6rem;
    border: 1px solid var(--color-grayscale-10);
  }
}
.dropdownButton {
  position: absolute;
  top: 0.75rem;
  right: 1.5rem;
  display: inline-block;

  &::v-deep .vs--open .vs__open-indicator {
    transform: rotate(0deg) scale(1);
  }
}
</style>