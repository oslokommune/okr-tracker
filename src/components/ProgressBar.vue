<template>
  <div :class="['progress-bar', skinClass, { 'progress-bar--compact': compact }]">
    <h4 v-if="title" class="pkt-txt-14-medium">{{ title }}</h4>
    <div
      :class="[
        'progress-bar__bar',
        { 'progress-bar__bar--min-indicator': showMinMaxIndicators && progression > 0 },
        { 'progress-bar__bar--max-indicator': showMinMaxIndicators && progression < 1 },
      ]"
    >
      <div
        class="progress-bar__value"
        :style="progressValueStyle"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="percent"
      ></div>
      <div
        v-if="showMinMaxIndicators && progression > 0.05"
        class="progress-bar__label progress-bar__label--min"
      >
        {{ formatPercent(0) }}
      </div>
      <div
        class="progress-bar__label progress-bar__label--val"
        :style="progressLabelStyle"
      >
        {{ formatPercent(progression) }}
      </div>
      <div
        v-if="showMinMaxIndicators && progression < 0.95"
        class="progress-bar__label progress-bar__label--max"
      >
        {{ formatPercent(1) }}
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';

export default {
  name: 'ProgressBar',

  props: {
    title: {
      type: String,
      default: null,
    },
    progression: {
      type: Number,
      default: 0,
    },
    skin: {
      type: String,
      default: 'blue',
      validator: (value) => ['blue', 'yellow', 'green'].includes(value),
    },
    showMinMaxIndicators: {
      type: Boolean,
      default: false,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    percent() {
      const percent = this.progression * 100;
      return percent > 100 ? 100 : percent;
    },

    progressLabelStyle() {
      return `left: max(-0.75rem, min(calc(100% - 1.75rem), calc(${this.percent}% - 1.05rem)))`;
    },

    progressValueStyle() {
      return `width: ${this.percent}%`;
    },

    skinClass() {
      if (this.progression >= 1) {
        return 'progress-bar--green';
      }
      return `progress-bar--${this.skin}`;
    },
  },

  methods: {
    formatPercent(val) {
      return format('.0%')(val);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.progress-bar {
  // Default skin colors: `blue`
  --progress-bar-bg: var(--color-grayscale-10);
  --progress-bar-value: var(--color-blue);
  --progress-bar-value-indicator: var(--color-blue-dark);

  width: 100%;

  h4 + &__bar {
    margin-top: 0.5rem;
  }

  &__bar {
    position: relative;
    margin-bottom: 1.5rem;
    background-color: var(--progress-bar-bg);

    &--min-indicator {
      border-left: 1px solid var(--color-grayscale-50);
    }
    &--max-indicator {
      border-right: 1px solid var(--color-grayscale-50);
    }
  }

  &__value {
    height: 1rem;
    background-color: var(--progress-bar-value);
    border-right: 1px solid var(--progress-bar-value-indicator);
  }

  &__label {
    position: absolute;
    bottom: -1.5rem;
    display: none;
    width: 2.1rem;
    color: var(--color-grayscale-40);
    text-align: center;
    @include get-text('pkt-txt-12-medium');

    @include bp('phablet-up') {
      display: block;
    }

    &--min {
      left: -0.25rem;
      text-align: left;
    }
    &--val {
      display: block;
      color: var(--progress-bar-value-indicator);
    }
    &--max {
      right: -0.25rem;
      text-align: right;
    }
  }

  &--compact {
    .progress-bar__value {
      height: 0.5rem;
      border-right: 0;
    }
  }

  &--green {
    --progress-bar-value: var(--color-green);
    --progress-bar-value-indicator: var(--color-green-dark);
  }

  &--yellow {
    --progress-bar-value: var(--color-yellow);
    --progress-bar-value-indicator: var(--color-yellow-70);
  }
}
</style>
