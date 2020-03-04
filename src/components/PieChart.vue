<template>
  <svg class="pie" ref="svg"></svg>
</template>

<script>
import { mapState } from 'vuex';
import Pie from '@/util/piechart';

export default {
  name: 'PieChart',

  data: () => ({
    pie: null,
  }),

  props: {
    darkmode: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapState(['activePeriod']),
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg, this.darkmode);
    if (!this.activePeriod) return;

    this.pie.render(this.activePeriod);
  },

  watch: {
    activePeriod(period) {
      if (!period) return;
      this.pie.render(period);
    },
  },
};
</script>
