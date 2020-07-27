<template>
  <div class="progress__container">
    <div class="progress__unit">{{ keyres.unit }}</div>
    <div class="progress__bar-container" :class="{ darkmode }">
      <div class="progress__bar" ref="bar" :class="{ completed, darkmode }" style="width: 0%;">
        <div class="progress__current-value" :data-progress="keyres.currentValue || keyres.startValue">
          {{ keyres.currentValue || keyres.startValue }}
        </div>
      </div>
      <div class="progress__change-container">
        <div class="progress__change" ref="change"></div>
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
    change() {
      return select(this.$refs.change);
    },
  },

  methods: {
    format(val) {
      return format('%')(val);
    },

    getWidth() {
      const { startValue, targetValue, currentValue } = this.keyres;

      const scale = scaleLinear().domain([startValue, targetValue]).clamp(true);

      const decimal = scale(currentValue || startValue);

      this.completed = decimal === 1;
      return this.format(decimal);
    },

    getChangeStyle(el) {
      const { fromValue, startValue, targetValue, toValue } = this.keyres;
      let fromPos = 0;
      let width = 0;
      let direction;

      const scale = scaleLinear().domain([startValue, targetValue]).clamp(true);

      if (toValue || fromValue <= 0) {
        fromPos = scale(fromValue);
        width = scale(toValue || 0) - fromPos;
        direction = 'positive';
      } else {
        fromPos = scale(toValue || 0);
        width = scale(fromValue) - fromPos;
        direction = 'negative';
      }

      el.style('width', this.format(width));
      el.style('left', this.format(fromPos));
      el.classed(direction, true);
    },
  },

  mounted() {
    this.bar.style('width', this.getWidth());
    this.getChangeStyle(this.change);
  },

  watch: {
    keyres() {
      this.bar.transition().duration(1000).style('width', this.getWidth());
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
    position: relative;
    grid-area: bar;
    height: 1.7em;
    padding: 2px;
    background: rgba($color-bg, 0.75);
    border: 1px solid $color-bg;
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
    background: $color-grey-100;
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

  &__change-container {
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
  }

  &__change {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 3px;

    $positive: rgba(#dddddd, 0.55);
    $negative: rgba(red, 0.08);

    &.positive {
      background: repeating-linear-gradient(-45deg, transparent, transparent 2.5px, $positive 2.5px, $positive 5px);
      border-left: 1px solid #e0e0e0;
      mix-blend-mode: multiply;
    }

    &.negative {
      background: $negative;
      mix-blend-mode: multiply;
    }
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
