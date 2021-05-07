<template>
  <widget :widget-id="widgetId" :title="getTitle()" icon="chart-pie">
    <svg ref="svg"></svg>
  </widget>
</template>

<script>
import PieChart from '@/util/PieChart';

export default {
  name: 'WidgetProgression',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    dimmed: {
      type: Boolean,
      required: false,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    svg: null,
    chart: null,
  }),

  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(data) {
        if (!this.chart) return;
        this.chart.render(data);
      },
    },
  },

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.svg;
      this.chart = new PieChart(this.svg, { dimmed: this.dimmed });
      this.chart.render(this.data);
    }, 150);
  },

  methods: {
    getTitle() {
      return this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
