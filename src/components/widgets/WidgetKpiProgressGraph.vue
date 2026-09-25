<script setup>
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Timestamp } from 'firebase/firestore';
import { max, min } from 'd3-array';
import { useAuthStore } from '@/store/auth';
import { useActiveKpiStore } from '@/store/activeKpi';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import { periodDates } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import { getComputedStyleVariable, DEFAULT_SERIES_OPTIONS } from '@/util/chart';
import PeriodTrendTag from '@/components/PeriodTrendTag.vue';
import LineChart from '@/components/generic/LineChart.vue';
import html2canvas from 'html2canvas';
import WidgetWrapper from './WidgetWrapper.vue';

const i18n = useI18n();

const { hasEditRights } = storeToRefs(useAuthStore());
const { kpi, progress, period, goals } = storeToRefs(useActiveKpiStore());

const container = ref(null);
const rendering = ref(false);

const chartOptions = computed(() => ({
  xMin: getStartDate(period.value, progress.value),
  xMax: getEndDate(period.value, progress.value),
  yMin: kpi.value.startValue === 'min' ? null : 0,
  valueFormatter: (val) => formatKPIValue(kpi.value, val),
}));

const chartSeries = computed(() => {
  const series = [
    {
      ...DEFAULT_SERIES_OPTIONS,
      name: i18n.t('kpi.progress'),
      data: progress.value.map((r) => [
        r.timestamp.toDate().toISOString(),
        r.value,
        r.comment,
      ]),
      color: getComputedStyleVariable('--color-blue-light'),
      areaStyle: { opacity: 0.25 },
    },
  ];

  if (goals.value.length) {
    series.push({
      ...DEFAULT_SERIES_OPTIONS,
      name: i18n.t('general.target'),
      data: goals.value
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
});

const formattedPeriod = computed(() =>
  periodDates({
    startDate: getStartDate(period.value, progress.value),
    endDate: getEndDate(period.value, progress.value),
  })
);

const imageFilename = computed(() =>
  [
    kpi.value.parent.slug,
    kpi.value.name
      .replace(/\s+/g, '-')
      .replace(/[/\\?%*!:|"<>]/g, '')
      .toLowerCase(),
    new Date().toISOString().slice(0, 10),
  ].join('-')
);

async function download() {
  rendering.value = true;
  await nextTick();
  html2canvas(container.value).then((canvas) => {
    rendering.value = false;
    canvas.toBlob((blob) => {
      downloadFile(blob, imageFilename.value, '.png');
    });
  });
}

/**
 * Return the start date of `period`. If unset, the earliest date
 * found in `progress` is returned instead.
 */
function getStartDate({ startDate }, values) {
  if (startDate) {
    const ts = Timestamp.fromDate(startDate);
    return ts.toDate ? ts.toDate() : new Date(ts);
  }

  return min(values, (d) => d.timestamp.toDate());
}

/**
 * Return the end date of `period`. If unset, the last date found in
 * `progress` is returned instead.
 */
function getEndDate({ endDate }, values) {
  if (endDate) {
    const ts = Timestamp.fromDate(endDate);
    return ts.toDate ? ts.toDate() : new Date(ts);
  }

  return max(values, (d) => d.timestamp.toDate());
}
</script>

<template>
  <WidgetWrapper :title="$t('kpi.progress')">
    <template #title-actions>
      <template v-if="hasEditRights">
        <pkt-button
          size="small"
          skin="primary"
          variant="icon-left"
          iconName="plus-sign"
          :aria-label="$t('kpi.newValue')"
          @click="$emit('add-value')"
        >
          <span>{{ $t('kpi.value') }}</span>
        </pkt-button>
        <pkt-button
          size="small"
          skin="tertiary"
          variant="icon-left"
          iconName="bullseye"
          :aria-label="$t('kpi.goals.set')"
          @click="$emit('set-goals')"
        >
          <span>{{ $t('kpi.goals.set') }}</span>
        </pkt-button>
        <div class="separator"></div>
      </template>
      <pkt-button
        v-if="progress.length"
        v-tooltip="$t('dashboard.downloadOptions.png')"
        size="small"
        skin="tertiary"
        variant="icon-left"
        iconName="download"
        :aria-label="$t('dashboard.downloadOptions.png')"
        @click="download"
      >
        <span>{{ $t('btn.download') }}</span>
      </pkt-button>
    </template>

    <div ref="container">
      <template v-if="rendering">
        <h1 class="pkt-txt-18 mb-size-8">{{ kpi.name }}</h1>
        <div class="pkt-txt-12-light mb-size-16">
          {{ formattedPeriod }}
        </div>
      </template>

      <LineChart
        class="progress-graph"
        v-bind="chartOptions"
        :series="chartSeries"
        show-legend
      />
    </div>

    <PeriodTrendTag :kpi="kpi" :progress="progress" class="mt-size-8 mb-size-12" />
  </WidgetWrapper>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.progress-graph {
  height: 300px;

  @include bp-up(36rem) {
    height: 400px;
  }

  @include bp('tablet-up') {
    height: 500px;
  }
}
</style>
