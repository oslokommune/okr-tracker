<template>
  <page-layout breakpoint="phablet" :class="['empty-page', `empty-page--${skin}`]">
    <template #default>
      <empty-state v-bind="$props" :show-graphic="false">
        <slot />
      </empty-state>
    </template>

    <template #footer>
      <buildings-graphic :skin="skin" class="empty-page__graphic" />
    </template>
  </page-layout>
</template>

<script>
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'EmptyPage',

  components: {
    BuildingsGraphic,
    EmptyState,
  },

  props: {
    heading: {
      type: String,
      required: false,
      default: null,
    },

    body: {
      type: String,
      required: false,
      default: null,
    },

    skin: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value),
    },
  },
};
</script>

<style lang="scss" scoped>
$-empty-page-skins: (
  info: var(--color-blue-10),
  success: var(--color-green-10),
  warning: var(--color-yellow-50),
  error: var(--color-red-5),
);

.empty-page {
  @each $skin, $color in $-empty-page-skins {
    &--#{$skin} {
      background-color: $color;
    }
  }

  &__graphic {
    display: block;
  }
}
</style>
