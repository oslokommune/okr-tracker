<template>
  <widget :title="$t('kpi.progress')">
    <template #title-actions>
      <template v-if="hasEditRights">
        <pkt-button
          size="small"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          :aria-label="$t('kpi.newValue')"
          @onClick="$emit('add-value')"
        >
          {{ $t('kpi.value') }}
        </pkt-button>
        <pkt-button
          size="small"
          skin="tertiary"
          variant="icon-left"
          icon-name="bullseye"
          :aria-label="$t('kpi.goals.set')"
          @onClick="$emit('set-goals')"
        >
          {{ $t('kpi.goals.set') }}
        </pkt-button>
        <div class="separator"></div>
      </template>
      <pkt-button
        v-tooltip="$t('dashboard.downloadOptions.png')"
        size="small"
        skin="tertiary"
        variant="icon-left"
        icon-name="download"
        :aria-label="$t('dashboard.downloadOptions.png')"
        @onClick="download"
      >
        {{ $t('btn.download') }}
      </pkt-button>
    </template>

    <!-- xmlns for download purposes -->
    <svg ref="progressGraphSvg" xmlns="http://www.w3.org/2000/svg"></svg>

    <period-trend-tag :kpi="kpi" :progress="progress" class="mt-size-8 mb-size-12" />
  </widget>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { max, min } from 'd3-array';
import firebase from 'firebase/compat/app';
import { PktButton } from '@oslokommune/punkt-vue2';
import { periodDates } from '@/util';
import downloadPng from '@/util/downloadPng';
import LineChart from '@/util/LineChart';
import { getPeriods } from '@/config/periods';
import PeriodTrendTag from '@/components/widgets/PeriodTrendTag.vue';
import WidgetWrapper from './WidgetWrapper.vue';

const { Timestamp } = firebase.firestore;

export default {
  name: 'WidgetKpiProgressGraph',

  components: {
    Widget: WidgetWrapper,
    PeriodTrendTag,
    PktButton,
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
  }),

  computed: {
    ...mapState('kpis', ['selectedPeriod']),
    ...mapGetters(['hasEditRights']),
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
      this.$nextTick(this._renderGraph);
    },

    _renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          height: 550,
          legend: true,
          tooltips: true,
        });
      }

      this.setStartAndEndDates();

      const kpi = this.kpi;

      this.graph.render({
        startDate: this.startDate,
        endDate: this.endDate,
        progress: this.progress,
        targets: this.goals
          .filter((g) => g.value !== null)
          .map((g) => ({
            startDate: g.fromDate.toDate(),
            endDate: g.toDate.toDate(),
            value: parseFloat(g.value),
          }))
          .filter((g) => g.endDate >= this.startDate && g.startDate <= this.endDate),
        kpi,
        startValue: kpi.startValue === 'min' ? null : 0,
      });
    },

    download() {
      const kpiName = this.kpi.name;
      const svgRef = this.$refs.progressGraphSvg;
      const formattedPeriod = periodDates({
        startDate: this.getStartDate(this.selectedPeriod, this.progress),
        endDate: this.getEndDate(this.selectedPeriod, this.progress),
      });

      downloadPng(svgRef, kpiName, kpiName, formattedPeriod);
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
