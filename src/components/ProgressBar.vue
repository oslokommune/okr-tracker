<template>
  <div class="progress__container">
    <div class="progress__unit">{{ keyres.unit }}</div>
    <div class="progress__bar-container" :class="{ darkmode }">
      <div class="progress__bar" ref="bar" :class="{ completed, darkmode }" style="width: 0%;">
        <div class="progress__current-value">{{ keyres.currentValue || keyres.startValue }}</div>
      </div>
    </div>
    <div class="progress__startValue">{{ keyres.startValue }}</div>
    <div class="progress__targetValue">{{ keyres.targetValue }}</div>
  </div>
</template>

<script>
import { scaleLinear, format, select } from 'd3';

export default {
  name: 'ProgressBar',

  data: () => ({
    completed: false,
  }),

  props: {
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

  computed: {
    bar() {
      return select(this.$refs.bar);
    },
  },

  methods: {
    format(val) {
      return format('%')(val);
    },

    getWidth() {
      const { startValue, targetValue, currentValue } = this.keyres;

      const scale = scaleLinear()
        .domain([startValue, targetValue])
        .clamp(true);

      const decimal = scale(currentValue || startValue);

      this.completed = decimal === 1;
      return this.format(decimal);
    },
  },

  mounted() {
    this.bar.style('width', this.getWidth());
  },

  watch: {
    keyres() {
      this.bar
        .transition()
        .duration(1000)
        .style('width', this.getWidth());
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';
.progress {
  &__container {
    display: grid;
    grid-gap: 0.15em;
    grid-template-areas:
      'unit unit unit'
      'bar bar bar'
      'startValue . targetValue';

    grid-template-rows: auto auto auto;
    grid-template-columns: auto 1.5em auto;
    font-size: 0.9em;
  }

  &__bar-container {
    grid-area: bar;
    height: 1.7em;
    padding: 2px;
    background: $color-bg;
    border-radius: 4px;

    &.darkmode {
      background: rgba(white, 0.1);
    }
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 50%;
    height: 100%;
    padding-right: 2px;
    overflow: hidden;
    background: $color-grey-200;
    border-radius: 3px;

    &.darkmode {
      background: rgba(white, 0.6);
    }

    &.completed {
      background: $color-yellow;

      &::before {
        display: inline-block;
        width: 100%;
        color: black;
        font-weight: 900;
        font-family: 'Font Awesome 5 Free';
        text-align: center;
        content: '\f00c';
      }

      > * {
        display: none;
      }
    }
  }

  &__unit {
    grid-area: unit;
  }

  &__current-value {
    display: flex;
    color: black;
    font-weight: 600;
    font-size: 0.9em;
  }

  &__startValue {
    grid-area: startValue;
  }

  &__targetValue {
    grid-area: targetValue;
    text-align: right;
  }
}
</style>
