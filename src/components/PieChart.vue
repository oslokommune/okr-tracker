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
    this.pie.render(this.product, this.activeQuarter);
  },

  watch: {
    product() {
      this.pie.render(this.product, this.activeQuarter);
    },
    activeQuarter() {
      this.pie.render(this.product, this.activeQuarter);
    },
  },
};
</script>
