<template>
  <div class="progression">
    <div class="progression__done">{{ percent(keyResult.progression) }} fullført</div>
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
}

.progression__container {
  position: relative;
  grid-row: 3;
  grid-column: 1 / span all;
  width: 100%;
  height: 0.8rem;
  margin-right: 1rem;
  background: var(--color-grey-100);
  border-radius: 1rem;
}

.progression__bar {
  height: 100%;
  padding-top: 0.05rem;
  color: var(--color-text);
  font-weight: 500;
  text-align: right;
  background: var(--color-secondary);
  border-radius: 1rem;
}

.progression__done {
  grid-area: 1 / 1 / 2 / 4;
  margin-bottom: 1rem;
  font-weight: 700;
}

.progression__unit {
  grid-row: 2;
  grid-column: 3;
}
</style>
