<template>
  <svg v-show="activePeriod" class="pie" ref="svg"></svg>
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

    progress() {
      return this.activePeriod && this.activePeriod.progression ? this.activePeriod.progression : 0;
    },
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg, this.darkmode);
    this.pie.render(this.activePeriod);
  },

  watch: {
    activePeriod(period) {
      this.pie.render(period);
    },
  },
};
</script>
