<template>
  <svg ref="progressionChartSvg" />
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/util/PieChart';

export default {
  name: 'ProgressionChart',

  props: {
    dimmed: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    svg: null,
    chart: null,
  }),

  computed: {
    ...mapState(['theme', 'activePeriod']),
  },

  watch: {
    activePeriod: {
      immediate: true,
      deep: true,
      handler(activePeriod) {
        if (!this.chart) return;
        this.chart.render(activePeriod, this.theme);
      },
    },

    theme: {
      immediate: true,
      handler() {
        if (!this.chart) return;
        this.chart.render(this.activePeriod, this.theme);
      },
    },
  },

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.progressionChartSvg;
      this.chart = new PieChart(this.svg, {
        dimmed: this.dimmed,
        colorMode: this.theme,
      });
      this.chart.render(this.activePeriod, this.theme);
    }, 150);
  },

  methods: {
    getTitle() {
      return this.title || this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
