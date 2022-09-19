<template>
  <div class="keyFigure">
    <div class="keyFigure__name title-4">
      {{ keyFigure.name[$i18n.locale] }}
    </div>

    <div class="keyFigure__value">
      <component :is="keyFigure.icon" class="keyFigure__icon" />
      {{ formatLargeNumber(keyFigure.value) }}
    </div>
  </div>
</template>

<script>
import { formatLargeNumber } from '@/util/format';

export default {
  name: 'KeyFigure',

  props: {
    keyFigure: {
      type: Object,
      required: true,
    },
  },

  methods: {
    formatLargeNumber,
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.keyFigure {
  color: var(--color-text);

  &__name {
    margin-bottom: 1rem;
  }

  &__value {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: typography.$font-size-4;
  }

  &__icon {
    margin-right: 0.5rem;
  }
}
</style>
