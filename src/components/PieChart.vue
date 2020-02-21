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
    ...mapState(['activeQuarter']),
  },

  mounted() {
    this.pie = new Pie(this.$refs.svg, this.darkmode);
    if (!this.document) return;
    if (!this.activeQuarter) return;

    this.pie.render(this.document, this.activeQuarter);
  },

  watch: {
    document(document) {
      if (!this.activeQuarter) return;
      this.pie.render(document, this.activeQuarter);
    },
    activeQuarter(quarter) {
      if (!quarter) return;
      this.pie.render(this.document, quarter);
    },
  },
};
</script>
