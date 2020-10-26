<template>
  <div class="progression__container" v-tooltip="percent(progression)">
    <div class="progression__bar" :style="{ width: percent(progression) }"></div>
  </div>
</template>

<script>
import { format } from 'd3';

export default {
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
@import '@/styles/_colors.scss';

.progression__container {
  position: relative;
  width: 100%;
  height: 4px;
  margin-right: 1rem;
  background: $color-grey-100;
}

.progression__bar {
  height: 100%;
  background: $color-yellow;
}
</style>
