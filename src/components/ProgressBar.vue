<template>
  <div class="progress-bar">
    <h4 v-if="title" class="progress-bar__title">{{ title }}</h4>
    <div class="progress-bar__bar">
      <span class="progress-bar__label" :style="progressLabelStyle">
        {{ formattedPercent }}
      </span>
      <div
        :class="[
          'progress-bar__value',
          { 'progress-bar__value--indicator': progression > 0 && progression < 1 },
          { 'progress-bar__value--complete': progression >= 1 },
        ]"
        :style="progressValueStyle"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="percent"
      ></div>
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
    leftLabel: {
      type: String,
      default: null,
    },
    rightLabel: {
      type: String,
      default: null,
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
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.progress-bar {
  width: 100%;

  &__title {
    @include get-text('pkt-txt-14-medium');
  }

  &__bar {
    position: relative;
    margin-top: 1.5rem;
    background-color: var(--color-grayscale-10);

    > span {
      position: absolute;
      top: -1.25rem;
      width: 2.1rem;
      text-align: center;
    }
  }

  &__value {
    height: 1rem;
    background-color: var(--color-blue);

    &--indicator {
      border-right: 1px solid var(--color-blue-dark);
    }

    &--complete {
      background-color: var(--color-green);
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
}
</style>
