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

  mounted() {
    this.pie = new Pie(this.$refs.svg);
    this.pie.render(this.product);
  },

  watch: {
    product() {
      this.pie.render(this.product);
    },
  },
};
</script>
