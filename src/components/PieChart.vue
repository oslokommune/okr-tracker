<template>
  <svg class="pie" ref="svg"></svg>
</template>

<script>
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
    chosenQuarter() {
      return this.$store.state.chosenQuarter;
    },
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
