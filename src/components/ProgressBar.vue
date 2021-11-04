<template>
  <div v-tooltip="percent(progression)" class="progression__container">
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
  },

  methods: {
    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.progression__container {
  position: relative;
  width: 100%;
  height: 5px;
  margin-right: 1rem;
  background: var(--color-grey-100);
}

.progression__bar {
  height: 100%;
  background: var(--color-secondary);
}
</style>
