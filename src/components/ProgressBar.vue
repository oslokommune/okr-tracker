<template>
  <div v-tooltip="label" class="progress">
    <progress
      :class="{ 'progress--isCompact': isCompact, 'progress--dark': dark }"
      max="100"
      :value="Math.min(progression, 100)"
      :aria-label="label"
    />
  </div>
</template>

<script>
import i18n from '@/locale/i18n';

export default {
  name: 'ProgressBar',

  props: {
    progression: {
      type: Number,
      default: 0,
    },
    isCompact: {
      type: Boolean,
      default: true,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    label() {
      return i18n.t('progress.complete', {
        progress: Math.round(this.progression),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
progress {
  display: block;
  width: 100%;
  height: 0.625rem;
  border: 0;
  border-radius: 0;

  &[value],
  &[value]::-webkit-progress-bar {
    background: var(--color-grayscale-10);
  }

  &[value]::-webkit-progress-value {
    background: var(--color-secondary);
  }

  &[value]::-moz-progress-bar {
    background: var(--color-secondary);
  }

  &.progress--isCompact {
    height: 0.3125rem;
  }

  &.progress--dark[value],
  &.progress--dark[value]::-webkit-progress-bar {
    background: var(--color-blue-dark-40);
  }
}
</style>
