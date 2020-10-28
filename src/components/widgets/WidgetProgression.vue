<template>
  <Widget :widget-id="widgetId" :title="getTitle()" icon="chart-pie">
    <svg ref="svg"></svg>
  </Widget>
</template>

<script>
import PieChart from '@/util/PieChart';
import { mapState } from 'vuex';

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
    type: {
      type: String,
      required: true,
    },
  },

  methods: {
    getTitle() {
      return this.$t(`widget.progression.${this.type}`);
    },
  },

  computed: {
    ...mapState(['activeItem', 'activePeriod']),
  },

  mounted() {
    setTimeout(() => {
      this.svg = this.$refs.svg;
      this.chart = new PieChart(this.svg, { dimmed: this.dimmed });
      this.chart.render(this.activePeriod);
    }, 1);
  },

  watch: {
    activePeriod: {
      immediate: true,
      deep: true,
      handler(period) {
        if (!this.chart) return;
        this.chart.render(period);
      },
    },
    activeItem: {
      immediate: true,
      handler() {
        if (!this.chart) return;
        this.chart.render(this.activePeriod);
      },
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>
