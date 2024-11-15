<script setup>
import { computed } from 'vue';
import { format } from 'd3-format';

const props = defineProps({
  progression: {
    type: Number,
    default: 0,
  },
  secondaryProgression: {
    type: Number,
    default: null,
  },
  secondaryValueLabel: {
    type: String,
    default: null,
  },
  skin: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green'].includes(value),
  },
  showMinMaxIndicators: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const valueStyle = computed(() => `width: ${percent(props.progression)}%`);
const secondaryValueStyle = computed(
  () => `width: ${percent(props.secondaryProgression)}%`
);
const skinClass = computed(() =>
  props.progression >= 1 ? 'progress-bar--green' : `progress-bar--${props.skin}`
);

function percent(progression) {
  const prc = progression * 100;
  return prc > 100 ? 100 : prc;
}

function percentFormatted(progression) {
  return format('.0%')(progression);
}

function progressLabelStyle(progression) {
  return `left: max(-2ch, min(calc(100% - 4ch), calc(${percent(progression)}% - 2.5ch)))`;
}
</script>

<template>
  <div :class="['progress-bar', skinClass, { 'progress-bar--compact': compact }]">
    <div
      :class="[
        'progress-bar__bar',
        { 'progress-bar__bar--secondary-val': secondaryProgression !== null },
        { 'progress-bar__bar--min-indicator': showMinMaxIndicators && progression > 0 },
        { 'progress-bar__bar--max-indicator': showMinMaxIndicators && progression < 1 },
      ]"
    >
      <div
        class="progress-bar__value progress-bar__value--primary"
        :style="valueStyle"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="percent(progression)"
      ></div>
      <div
        v-if="secondaryProgression !== null"
        class="progress-bar__value progress-bar__value--secondary"
        :style="secondaryValueStyle"
      ></div>
      <div
        v-if="showMinMaxIndicators && progression > 0.1"
        class="progress-bar__label progress-bar__label--min"
      >
        {{ percentFormatted(0) }}
      </div>
      <div
        class="progress-bar__label progress-bar__label--val"
        :style="progressLabelStyle(progression)"
      >
        {{ percentFormatted(progression) }}
      </div>
      <div
        v-if="secondaryProgression !== null"
        class="progress-bar__label progress-bar__label--secondary-val"
        :style="progressLabelStyle(secondaryProgression)"
      >
        <template v-if="secondaryValueLabel">
          {{ secondaryValueLabel }}
        </template>
        <template v-else>
          {{ percentFormatted(secondaryProgression) }}
        </template>
      </div>
      <div
        v-if="showMinMaxIndicators && progression < 0.9"
        class="progress-bar__label progress-bar__label--max"
      >
        {{ percentFormatted(1) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.progress-bar {
  // Default skin colors: `blue`
  --progress-bar-bg: var(--color-grayscale-10);
  --progress-bar-value: var(--color-blue);
  --progress-bar-value-indicator: var(--color-blue-dark);

  width: 100%;

  &__bar {
    position: relative;
    height: 1rem;
    margin-bottom: 1.5rem;
    background-color: var(--progress-bar-bg);

    &--secondary-val {
      margin-top: 1.5rem;
    }
    &--min-indicator {
      border-left: 1px solid var(--color-grayscale-50);
    }
    &--max-indicator {
      border-right: 1px solid var(--color-grayscale-50);
    }
  }

  &__value {
    position: absolute;
    top: 0;
    left: 0;
    height: inherit;

    &--primary {
      background-color: var(--progress-bar-value);
      border-right: 1px solid var(--progress-bar-value-indicator);
    }

    &--secondary {
      border-right: 1px dashed var(--progress-bar-value-indicator);
    }
  }

  &__label {
    position: absolute;
    bottom: -1.5rem;
    display: none;
    width: 5ch;
    text-align: center;
    @include get-text('pkt-txt-12-medium');

    @include bp('phablet-up') {
      display: block;
    }

    &--val,
    &--secondary-val {
      display: block;
      color: var(--progress-bar-value-indicator);
    }
    &--secondary-val {
      top: -1.5rem;
      bottom: auto;
    }
    &--min {
      left: -0.25rem;
      text-align: left;
    }
    &--max {
      right: -0.25rem;
      text-align: right;
    }
  }

  &--compact {
    .progress-bar__bar {
      height: 0.5rem;
    }

    .progress-bar__value {
      border-right: 0;
    }
  }

  &--green {
    --progress-bar-value: var(--color-green);
    --progress-bar-value-indicator: var(--color-green-dark);
  }
}
</style>
