<template>
  <svg ref="progressionChartSvg" />
</template>

<script>
import PieChart from '@/util/PieChart';

export default {
  name: 'ProgressionChart',

  props: {
    progression: {
      type: Number,
      required: true,
    },
    period: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    svg: null,
    chart: null,
  }),

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.progressionChartSvg;
      this.chart = new PieChart(this.svg);

      this.renderProgressionChart();
    }, 150);
  },

  methods: {
    renderProgressionChart() {
      if (this.chart) {
        this.chart.render(this.progression, this.period);
      }
    },
    getTitle() {
      return this.title || this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
