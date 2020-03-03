<template>
  <svg class="pie" ref="svg"></svg>
</template>

<script>
import Pie from '@/util/piechart';

export default {
  name: 'PieChart',

  data: () => ({
    pie: null,
  }),

  props: {
    document: {
      type: Object,
      required: true,
    },
    darkmode: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    period() {
      if (!this.$route.query.period) return;
      return this.$route.query.period.replace('-', ' ').toUpperCase();
    },
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg, this.darkmode);
    if (!this.document) return;
    if (!this.period) return;

    this.pie.render(this.document, this.period);
  },

  watch: {
    document(document) {
      if (!this.period) return;
      this.pie.render(document, this.period);
    },
    period(quarter) {
      if (!quarter) return;
      this.pie.render(this.document, quarter);
    },
  },
};
</script>
