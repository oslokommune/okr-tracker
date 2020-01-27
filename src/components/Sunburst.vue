<template>
  <svg ref="graph"></svg>
</template>

<script>
import { mapState } from 'vuex';
import Sunburst from '../util/sunburst-chart';

export default {
  data: () => ({
    graph: null,
  }),
  computed: {
    ...mapState(['nest']),
  },
  mounted() {
    this.graph = new Sunburst(this.$refs.graph);
    if (this.nest.length) {
      this.graph.render(this.nest);
    }
  },

  watch: {
    nest() {
      if (this.nest.length) {
        this.graph.render(this.nest);
      }
    },
  },
};
</script>
