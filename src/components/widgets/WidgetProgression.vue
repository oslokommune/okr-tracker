<template>
  <Widget :widget-id="widgetId" :title="$t('objective.progression')" icon="chart-pie">
    <svg ref="svg"></svg>
  </Widget>
</template>

<script>
import PieChart from '@/util/PieChart';

export default {
  data: () => ({
    svg: null,
    chart: null,
  }),

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
  },

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.svg;
      this.chart = new PieChart(this.svg, { dimmed: this.dimmed });
      this.chart.render(this.data);
    }, 100);
  },

  watch: {
    activePeriod(period) {
      if (!this.chart) return;
      this.chart.render(period);
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>
