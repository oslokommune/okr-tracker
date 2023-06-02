<template>
  <div class="mini-graph">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 200"
      preserveAspectRatio="xMidYMid meet"
    >
      <g class="lineChart">
        <path class="area" :d="area" />
        <path class="line" :d="line" :stroke-width="compact ? 16 : 8" />
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleTime, scaleLinear } from 'd3-scale';
import { area, line, curveLinear } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent, max, min } from 'd3-array';

export default {
  name: 'MiniGraph',

  props: {
    kpiData: {
      type: Array,
      required: false,
      default: () => [],
    },
    startValue: {
      type: String,
      required: false,
      default: 'zero',
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      data: [],
      chartDefaults: {
        width: 1000,
        height: 200,
      },
      line: '',
      area: '',
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
      const x = scaleTime()
        .domain(
          extent(this.data, function (d) {
            return d.date;
          })
        )
        .rangeRound([0, this.chartDefaults.width]);
      const y = scaleLinear()
        .domain([
          this.startValue === 'min' ? min(this.data, (d) => d.count) : 0,
          max(this.data, (d) => d.count),
        ])
        .range([this.chartDefaults.height, 0]);
      axisBottom().scale(x);
      axisLeft().scale(y);

      return { x, y };
    },
    calculatePath() {
      const scale = this.getScales();
      const generateArea = area()
        .x((d) => {
          return scale.x(d.date);
        })
        .y0(this.chartDefaults.height)
        .y1((d) => {
          return scale.y(d.count);
        });

      const generateLine = line()
        .x((d) => {
          return scale.x(d.date);
        })
        .y((d) => {
          return scale.y(d.count);
        })
        .curve(curveLinear);

      this.area = generateArea(this.data);
      this.line = generateLine(this.data);
    },
  },
};
</script>

<style lang="scss" scoped>
.mini-graph {
  width: 100%;
}

path.line {
  fill: none;
  stroke: var(--color-blue-light);
}

.area {
  fill: var(--color-blue-5);
  stroke-width: 0;
}
</style>
