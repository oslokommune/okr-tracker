<template>
  <vue-e-charts
    v-if="isMounted"
    :init-options="initOptions"
    :option="options"
    autoresize
    @click="$emit('click', $event)"
  />
</template>

<script>
import VueECharts from 'vue-echarts';
import { use, registerLocale } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  LegendComponent,
  GridComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import i18n from '@/locale/i18n';
import { dateShort } from '@/util';
import { getComputedStyleVariable, LOCALE_NO } from '@/util/chart';

use([
  GridComponent,
  LegendComponent,
  LineChart,
  MarkLineComponent,
  SVGRenderer,
  TitleComponent,
  TooltipComponent,
]);

registerLocale('NO', LOCALE_NO);

export default {
  name: 'LineChart',

  components: {
    VueECharts,
  },

  props: {
    series: {
      type: Array,
      default: () => [],
    },
    xMin: {
      type: Date,
      default: null,
    },
    xMax: {
      type: Date,
      default: null,
    },
    yMin: {
      type: Number,
      default: null,
    },
    yMax: {
      type: Number,
      default: null,
    },
    valueFormatter: {
      type: Function,
      default: null,
    },
    sparkline: {
      type: Boolean,
      default: false,
    },
    showLegend: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isMounted: false,
    initOptions: {
      locale: i18n.locale === 'nb-NO' ? 'NO' : 'EN',
    },
  }),

  computed: {
    options() {
      return {
        textStyle: {
          fontFamily: "'Oslo Sans', arial, sans-serif",
        },
        grid: this.gridOptions,
        legend: {
          show: this.showLegend,
          bottom: 10,
          icon: 'rect',
          itemGap: 24,
          itemWidth: 12,
          itemHeight: 12,
        },
        tooltip: {
          trigger: 'axis',
          formatter: this.customTooltip,
          className: 'echarts-tooltip',
          axisPointer: {
            animation: false,
          },
        },
        xAxis: {
          show: !this.sparkline,
          type: 'time',
          min: this.xMin ? this.xMin.toISOString() : null,
          max: this.xMax ? this.xMax.toISOString() : null,
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: getComputedStyleVariable('--color-grayscale-10'),
              width: 2,
            },
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: getComputedStyleVariable('--color-grayscale-10'),
              width: 2,
            },
          },
          axisLabel: {
            formatter: {
              year: '{year|{yyyy}}',
              day: '{d}. {MMM}',
            },
            rich: {
              year: {
                fontWeight: 500,
                fontSize: 12,
              },
            },
            interval: 100,
            fontSize: 12,
            hideOverlap: true,
            lineHeight: 24,
            color: getComputedStyleVariable('--color-blue-dark'),
          },
        },
        yAxis: {
          show: !this.sparkline,
          type: 'value',
          scale: 'value',
          min: this.yMin,
          max: this.yMax,
          boundaryGap: this.boundaryGap,
          axisLabel: {
            formatter: this.valueFormatter,
          },
          splitLine: {
            lineStyle: {
              color: getComputedStyleVariable('--color-grayscale-10'),
            },
          },
        },
        series: this.series,
      };
    },

    gridOptions() {
      if (this.sparkline) {
        return { top: 5, bottom: 5, left: 5, right: 5 };
      }
      return {
        top: 15,
        bottom: this.showLegend ? 50 : 15,
        left: 15,
        right: 15,
        containLabel: true,
      };
    },

    boundaryGap() {
      let neg = '10%';

      if (!this.yMin) {
        const minVal = Math.min(
          ...this.series.map((s) => s.data.map((r) => r[1])).flat()
        );
        neg = minVal >= 0 ? 0 : '10%';
      }

      return [neg, '10%'];
    },
  },

  mounted() {
    this.isMounted = true;
  },

  methods: {
    customTooltip(params) {
      const [x, y, comment] = params[0].data;
      const timestamp = dateShort(new Date(x));
      const value = this.valueFormatter ? this.valueFormatter(y) : y;

      if (this.sparkline) {
        return (
          '<div class="tooltip tooltip--compact">' +
          ` <div class="pkt-txt-12">${timestamp}</div>` +
          ` <div class="pkt-txt-14-medium">${value}</div>` +
          '</div>'
        );
      }

      return (
        '<div class="tooltip">' +
        ` <div class="pkt-txt-12">${timestamp}</div>` +
        ` <div class="pkt-txt-16-medium">${value}</div>${
          comment ? `<div class="pkt-txt-12-light">${comment}</div>` : ''
        }</div>`
      );
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .echarts-tooltip {
  // https://github.com/apache/echarts/issues/15831
  padding: 0 !important;
  border: 0 !important;
  box-shadow: none !important;

  .tooltip {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: 13rem;
    padding: 0.5rem 1rem;
    overflow-wrap: break-word;
    background-color: var(--color-white);
    border: 2px solid var(--color-grayscale-10);

    > div:nth-child(3) {
      display: -webkit-box;
      max-height: 100%;
      overflow: hidden;
      white-space: normal;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 10;
    }

    &--compact {
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
