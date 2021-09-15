<template>
  <div class="progression">
    <div class="progression__unit">{{ keyResult.unit }}</div>
    <div v-tooltip="percent(keyResult.progression)" class="progression__container">
      <div class="progression__bar" :style="{ width: percent(keyResult.progression) }">
        {{ keyResult.currentValue }}
      </div>
    </div>
    <div class="progression__start">{{ keyResult.startValue }}</div>
    <div class="progression__target">{{ keyResult.targetValue }}</div>
  </div>
</template>

<script>
import { format } from 'd3';

export default {
  name: 'ProgressBarExpanded',

  props: {
    keyResult: {
      type: Object,
      required: true,
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

.progression {
  display: grid;
  grid-template-rows: auto auto auto;
  grid-template-columns: 1fr 1fr;
  font-size: 0.85rem;
}

.progression__container {
  position: relative;
  grid-row: 2;
  grid-column: 1 / span all;
  width: 100%;
  height: 1.2rem;
  margin-right: 1rem;
  background: $color-grey-100;
}

.progression__bar {
  height: 100%;
  padding-top: 0.05rem;
  padding-right: 0.25rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-align: right;
  background: var(--color-primary);
}

.progression__unit {
  grid-row: 1;
  grid-column: 1 / span all;
}

.progression__start {
  grid-row: 3;
  grid-column: 1;
}

.progression__target {
  grid-row: 3;
  grid-column: 2;
  text-align: right;
}
</style>
