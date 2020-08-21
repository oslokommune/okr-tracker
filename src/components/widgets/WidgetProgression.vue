<template>
  <Widget title="Progression" icon="chart-pie">
    <svg ref="svg"></svg>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/util/PieChart';

export default {
  data: () => ({
    svg: null,
    chart: null,
  }),

  computed: {
    ...mapState(['activePeriod']),
  },

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.svg;
      this.chart = new PieChart(this.svg);
      this.chart.render(this.activePeriod);
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
