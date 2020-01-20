<template>
  <div>
    <svg ref="progressbar" class="progressbar"></svg>
    <resize-observer @notify="handleResize" />
  </div>
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
    darkmode: {
      type: Boolean,
      required: false,
      default: false,
    },
    keyres: {
      type: Object,
      required: true,
    },
  },

  methods: {
    handleResize() {
      this.progressbar.render(this.keyres);
    },
  },

  watch: {
    keyres(newValue) {
      this.progressbar.render(newValue);
    },
  },

  mounted() {
    this.progressbar = this.compressed
      ? new ProgressbarSmall(this.$refs.progressbar)
      : new Progressbar(this.$refs.progressbar);

    if (this.darkmode && !this.compressed) {
      this.progressbar.darkmode();
    }

    this.progressbar.render(this.keyres);
  },
};
</script>
