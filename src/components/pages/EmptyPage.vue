<script setup>
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';
import EmptyState from '@/components/EmptyState.vue';

defineProps({
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
    validator: (value) => ['info', 'success', 'warning', 'error', 'dim'].includes(value),
  },
});
</script>

<template>
  <PageLayout breakpoint="phablet" :class="['empty-page', `empty-page--${skin}`]">
    <template #default>
      <EmptyState v-bind="$props" :show-graphic="false">
        <slot />
      </EmptyState>
    </template>

    <template #footer>
      <BuildingsGraphic :skin="skin" class="empty-page__graphic" />
    </template>
  </PageLayout>
</template>

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
