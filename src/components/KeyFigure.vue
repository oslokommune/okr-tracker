<template>
  <div class="keyFigure">
    <div class="keyFigure__name">
      {{ keyFigure.name[$i18n.locale] }}
    </div>

    <div class="keyFigure__value">
      <component :is="icon" class="keyFigure__icon" />
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

  computed: {
    icon() {
      return () => import(/* @vite-ignore */ `./${this.keyFigure.icon}.vue`);
    },
  },

  methods: {
    formatLargeNumber,
  },
};
</script>

<style lang="scss" scoped>
.keyFigure {
  &__name {
    margin-bottom: 1rem;
  }

  &__value {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 500;
  }

  &__icon {
    margin-right: 0.5rem;
  }
}
</style>
