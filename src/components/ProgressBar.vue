<template>
  <svg ref="progressbar" class="progressbar"></svg>
</template>

<script>
import Progressbar from '../util/progressbar';
import ProgressbarSmall from '../util/progressbar-small';

export default {
  data: () => ({
    progressbar: null,
  }),

  props: {
    compressed: {
      type: Boolean,
      required: false,
      default: false,
    },
    keyres: {
      type: Object,
      required: true,
    },
  },

  mounted() {
    this.progressbar = this.compressed
      ? new ProgressbarSmall(this.$refs.progressbar)
      : new Progressbar(this.$refs.progressbar);

    this.progressbar.render(this.keyres);
  },
};
</script>
