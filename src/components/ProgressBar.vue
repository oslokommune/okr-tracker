<template>
  <div
    v-tooltip="percent(progression)"
    class="progression__container"
    :class="{ 'progression__container--isCompact': isCompact }"
  >
    <div class="progression__bar" :style="{ width: percent(progression) }"></div>
  </div>
</template>

<script>
import { format } from 'd3-format';

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

  methods: {
    percent(value) {
      if (value < 0) return 0;
      if (value > 1) return 100;

      return format('.0%')(value);
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
  background: var(--color-progress-background);

  &--isCompact {
    height: 0.3125rem;
  }
}

.progression__bar {
  height: 100%;
  background: var(--color-secondary);
}
</style>
