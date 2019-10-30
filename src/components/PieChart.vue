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
    ...mapState(['chosenQuarter']),
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg);
    this.pie.render(this.product, this.chosenQuarter);
  },

  watch: {
    product() {
      this.pie.render(this.product, this.chosenQuarter);
    },
  },
};
</script>
