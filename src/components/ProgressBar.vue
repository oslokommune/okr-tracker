<template>
  <div
    v-tooltip="`${progression}%`"
    class="progression__container"
    :class="{ 'progression__container--isCompact': isCompact }"
  >
    <div class="progression__bar" :style="{ width: progressBarWidth }"></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',

  props: {
    progression: {
      type: Number,
      default: 0,
    },
    isCompact: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    progressBarWidth() {
      if (!this.progression || this.progression < 0) {
        return 0;
      }
      if (this.progression > 100) {
        return '100%';
      }

      return `${this.progression}%`;
    },
  },
};
</script>

<style lang="scss" scoped>
.progression__container {
  position: relative;
  width: 100%;
  height: 0.625rem;
  margin-right: 1rem;
  background: var(--color-blue-dark-40);

  &--isCompact {
    height: 0.3125rem;
  }
}

.progression__bar {
  height: 100%;
  background: var(--color-secondary);
}
</style>
