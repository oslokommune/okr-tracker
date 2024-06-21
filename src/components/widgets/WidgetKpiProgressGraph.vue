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
        v-if="progress.length"
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

    <div ref="progressGraphContainer">
      <template v-if="rendering">
        <h1 class="pkt-txt-18 mb-size-8">{{ kpi.name }}</h1>
        <div class="pkt-txt-12-light mb-size-16">
          {{ formattedPeriod }}
        </div>
      </template>

      <line-chart
        class="progress-graph"
        v-bind="chartOptions"
        :series="chartSeries"
        show-legend
      />
    </div>

    <period-trend-tag :kpi="kpi" :progress="progress" class="mt-size-8 mb-size-12" />
  </widget>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { max, min } from 'd3-array';
import firebase from 'firebase/compat/app';
import { PktButton } from '@oslokommune/punkt-vue2';
import { periodDates } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import { getComputedStyleVariable, DEFAULT_SERIES_OPTIONS } from '@/util/chart';
import PeriodTrendTag from '@/components/widgets/PeriodTrendTag.vue';
import LineChart from '@/components/generic/LineChart.vue';
import html2canvas from 'html2canvas';
import WidgetWrapper from './WidgetWrapper.vue';

const { Timestamp } = firebase.firestore;

export default {
  name: 'WidgetKpiProgressGraph',

  components: {
    Widget: WidgetWrapper,
    PeriodTrendTag,
    PktButton,
    LineChart,
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
    rendering: false,
  }),

  computed: {
    ...mapState('kpis', ['selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    chartSeries() {
      const series = [
        {
          ...DEFAULT_SERIES_OPTIONS,
          name: this.$t('kpi.progress'),
          data: this.progress.map((r) => [
            r.timestamp.toDate().toISOString(),
            r.value,
            r.comment,
          ]),
          color: getComputedStyleVariable('--color-blue-light'),
          areaStyle: { opacity: 0.25 },
        },
      ];

      if (this.goals.length) {
        series.push({
          ...DEFAULT_SERIES_OPTIONS,
          name: this.$t('general.target'),
          data: this.goals
            .map((g) => [
              [g.fromDate.toDate().toISOString(), g.value],
              [g.toDate.toDate().toISOString(), g.value],
              [g.toDate.toDate().toISOString(), null],
            ])
            .flat(),
          color: getComputedStyleVariable('--color-green'),
          label: { show: true },
          showSymbol: false,
          tooltip: { show: false },
        });
      }

      return series;
    },

    chartOptions() {
      const xMin = this.getStartDate(this.selectedPeriod, this.progress);
      const xMax = this.getEndDate(this.selectedPeriod, this.progress);

      return {
        xMin,
        xMax,
        yMin: this.kpi.startValue === 'min' ? null : 0,
        valueFormatter: (val) => formatKPIValue(this.kpi, val),
      };
    },

    imageFilename() {
      const now = new Date();
      return [
        this.kpi.parent.slug,
        this.kpi.name
          .replace(/\s+/g, '-')
          .replace(/[/\\?%*!:|"<>]/g, '')
          .toLowerCase(),
        now.toISOString().slice(0, 10),
      ].join('-');
    },

    formattedPeriod() {
      return periodDates({
        startDate: this.getStartDate(this.selectedPeriod, this.progress),
        endDate: this.getEndDate(this.selectedPeriod, this.progress),
      });
    },
  },

  methods: {
    async download() {
      this.rendering = true;
      this.$nextTick(() => {
        html2canvas(this.$refs.progressGraphContainer).then((canvas) => {
          this.rendering = false;
          canvas.toBlob((blob) => {
            downloadFile(blob, this.imageFilename, '.png');
          });
        });
      });
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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.progress-graph {
  height: 300px;

  @include bp('phablet-up') {
    height: 400px;
  }

  @include bp('tablet-up') {
    height: 500px;
  }
}
</style>
