<template>
  <widget :widget-id="widgetId" :title="getTitle()">
    <svg ref="svg"></svg>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
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
      this.svg = this.$refs.svg;
      this.chart = new PieChart(this.svg, { dimmed: this.dimmed, colorMode: this.theme });
      this.chart.render(this.activePeriod, this.theme);
    }, 150);
  },

  methods: {
    getTitle() {
      return this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
