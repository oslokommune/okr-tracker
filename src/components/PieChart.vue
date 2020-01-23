<template>
  <svg class="pie" ref="svg"></svg>
</template>

<script>
import { mapState } from 'vuex';
import Pie from '@/util/piechart';

export default {
  data: () => ({
    pie: null,
  }),

  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['activeQuarter']),
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg);
    if (!this.product) return;
    if (!this.activeQuarter) return;

    this.pie.render(this.product, this.activeQuarter);
  },

  watch: {
    product(product) {
      if (!this.activeQuarter) return;
      this.pie.render(product, this.activeQuarter);
    },
    activeQuarter(quarter) {
      if (!quarter) return;

      this.pie.render(this.product, quarter);
    },
  },
};
</script>
