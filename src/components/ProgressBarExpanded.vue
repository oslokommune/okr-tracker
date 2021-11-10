<template>
  <div class="progression">
    <div class="progression__done">{{ percent(keyResult.progression) }} fullført</div>
    <div class="progression__remaining">{{ percent(keyResult.progression) }} gjenstår</div>
    <button class="btn progression__total">
      <span class="progression__total--current">{{ keyResult.currentValue || 0 }}</span>
      <span class="progression__total--target">/{{ keyResult.targetValue }}</span>
    </button>
    <div class="progression__container">
      <div class="progression__bar" :style="{ width: percent(keyResult.progression) }"></div>
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';

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
  grid-template-columns: 1fr auto;
  color: var(--color-text-secondary);
  padding: 1.5rem 0;
  grid-column-gap: 0;
  grid-row-gap: 0;
}

.progression__container {
  position: relative;
  grid-area: 3 / 1 / 4 / 3;
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
  grid-area: 1 / 1 / 2 / 3;
  font-weight: 500;
}
.progression__remaining {
  grid-area: 2 / 1 / 3 / 3;
  margin-bottom: 1rem;
  font-weight: 500;
}

.progression__total {
  grid-area: 1 / 2 / 3 / 3;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;

  &:hover {
    background-color: var(--color-secondary);
  }
}

.progression__total--current {
  color: var(--color-text);
  font-weight: 700;
}

.progression__total--target {
  color: var(--color-grey-400);
}

.progression__unit {
  grid-row: 2;
  grid-column: 3;
}
</style>
