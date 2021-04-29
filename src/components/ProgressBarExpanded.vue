<template>
  <div class="progression">
    <div class="title-1 progression__done">{{ percent(keyResult.progression) }} fullført</div>
    <div class="title-2 progression__unit">{{ remaining() }} {{ keyResult.unit }} gjenstår</div>
    <div class="progression__container">
      <div class="progression__bar" :style="{ width: percent(keyResult.progression) }"></div>
    </div>
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

    remaining() {
      if (this.keyResult.targetValue < this.keyResult.startValue) {
        if (!this.keyResult.currentValue) {
          return this.keyResult.startValue;
        }
        return this.keyResult.startValue - this.keyResult.currentValue;
      }
      if (!this.keyResult.currentValue) {
        return this.keyResult.targetValue;
      }
      return this.keyResult.targetValue - this.keyResult.currentValue;
    },
  },
};
</script>

<style lang="scss" scoped>
.progression {
  display: grid;
  grid-template-rows: auto auto auto;
  grid-template-columns: 1fr 1fr;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.progression__container {
  position: relative;
  grid-row: 3;
  grid-column: 1 / span all;
  width: 100%;
  height: 1.2rem;
  margin-right: 1rem;
  background: var(--color-grey-100);
}

.progression__bar {
  height: 100%;
  padding-top: 0.05rem;
  padding-right: 0.25rem;
  color: var(--color-text);
  font-weight: 500;
  text-align: right;
  background: var(--color-secondary);
}

.progression__done {
  grid-area: 1 / 1 / 2 / 4;
  margin-bottom: 2rem;
  font-weight: 700;
}

.progression__unit {
  grid-row: 2;
  grid-column: 3;
}
</style>
