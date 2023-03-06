<template>
  <div class="miniGraph">
    <span v-if="data.length === 1" class="miniGraph__noGraph">{{
      $t('kpi.noGraph')
    }}</span>
    <svg
      v-else
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid meet"
    >
      <g class="lineChart" :transform="translate">
        <path class="area" :d="area" />
        <path class="line" :d="line" />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'MiniGraph',

  props: {
    kpiData: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      data: [],
      chartDefaults: {
        width: 800,
        height: 200,
        chartId: 'mini-line-chart',
        gridOpacity: 1,
      },
      line: '',
      area: '',
      translate: `translate(${0},${0})`,
    };
  },

  watch: {
    kpiData: {
      immediate: true,
      handler: 'setData',
    },
  },

  methods: {
    setData() {
      this.data = [];
      const graphDots = 20;
      const step =
        this.kpiData.length > graphDots ? Math.round(this.kpiData.length / graphDots) : 1;
      this.kpiData.forEach((d, i) => {
        if (step === 1 || i % step === 1) {
          this.data.push({
            date: d.timestamp.toDate(),
            count: d.value,
          });
        }
      });
      this.data.sort((a, b) => (a.date > b.date ? 1 : -1));
      this.calculatePath();
    },
    getScales() {
      const x = d3
        .scaleTime()
        .domain(
          d3.extent(this.data, function (d) {
            return d.date;
          })
        )
        .rangeRound([0, this.chartDefaults.width]);
      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(this.data, function (d) {
            return d.count < 1 ? 1 : d.count;
          }),
        ])
        .range([this.chartDefaults.height, 0]);
      d3.axisBottom().scale(x);
      d3.axisLeft().scale(y);

      return { x, y };
    },
    calculatePath() {
      const scale = this.getScales();
      const area = d3
        .area()
        .x((d) => {
          return scale.x(d.date);
        })
        .y0(this.chartDefaults.height)
        .y1((d) => {
          return scale.y(d.count);
        });

      const path = d3
        .line()
        .x((d) => {
          return scale.x(d.date);
        })
        .y((d) => {
          return scale.y(d.count);
        })
        .curve(d3.curveLinear);

      this.area = area(this.data);
      this.line = path(this.data);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';
.miniGraph {
  padding-top: 2rem;

  &__noGraph {
    color: var(--color-grayscale-40);
    font-weight: 400;
    font-size: typography.$font-size-1;
  }
}
path.line {
  fill: none;
  stroke-width: 0.4rem;
  stroke: var(--color-blue-light);
}
.area {
  fill: var(--color-blue-5);
  stroke-width: 0;
}
</style>
