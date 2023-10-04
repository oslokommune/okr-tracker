<template>
  <div :class="['progress-bar', skinClass, { 'progress-bar--compact': compact }]">
    <h4 v-if="title" class="pkt-txt-14-medium">{{ title }}</h4>
    <div class="progress-bar__bar">
      <div
        :class="[
          'progress-bar__value',
          { 'progress-bar__value--indicator': progression > 0 && progression < 1 },
        ]"
        :style="progressValueStyle"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="percent"
      ></div>
      <span class="progress-bar__label" :style="progressLabelStyle">
        {{ formattedPercent }}
      </span>
    </div>
    <div v-if="leftLabel || rightLabel" class="progress-bar__sub-labels">
      <span v-if="leftLabel" class="progress-bar__label">
        {{ leftLabel }}
      </span>
      <span v-if="rightLabel" class="progress-bar__label progress-bar__label--right">
        {{ rightLabel }}
      </span>
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
    leftLabel: {
      type: String,
      default: null,
    },
    rightLabel: {
      type: String,
      default: null,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    formattedPercent() {
      return format('.0%')(this.progression);
    },

    percent() {
      const percent = this.progression * 100;
      return percent > 100 ? 100 : percent;
    },

    progressLabelStyle() {
      return `left: max(-0.2rem, min(calc(100% - 2.25rem), calc(${this.percent}% - 1rem)))`;
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
    margin-bottom: 1rem;
    background-color: var(--progress-bar-bg);

    > span {
      position: absolute;
      bottom: -1.25rem;
      width: 2.1rem;
      text-align: center;
    }
  }

  &__value {
    height: 1rem;
    background-color: var(--progress-bar-value);

    &--indicator {
      border-right: 1px solid var(--progress-bar-value-indicator);
    }
  }

  &__label {
    @include get-text('pkt-txt-12-medium');
  }

  &__sub-labels {
    display: flex;
    padding: 0.15rem 0.25rem;

    .progress-bar__label--right {
      margin-left: auto;
    }
  }

  &--compact {
    .progress-bar__value {
      height: 0.5rem;
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
