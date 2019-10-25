<template>
  <svg ref="progressbar" class="progressbar"></svg>
</template>

<script>
import Progressbar from '../util/progressbar';

export default {
  data: () => ({
    progressbar: null,
  }),

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  mounted() {
    this.progressbar = new Progressbar(this.$refs.progressbar);
    this.progressbar.render(this.keyres);
  },
};
</script>
