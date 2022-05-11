<template>
  <svg ref="progressionChartSvg" />
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/util/PieChart';

export default {
  name: 'ProgressionChart',

  props: {
    progression: {
      type: Number,
      required: true,
    },
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
    theme: {
      immediate: true,
      handler() {
        this.renderProgressionChart();
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

      this.renderProgressionChart();
    }, 150);
  },

  methods: {
    renderProgressionChart() {
      if (this.chart) {
        this.chart.render(this.progression, this.activePeriod, this.theme);
      }
    },
    getTitle() {
      return this.title || this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
