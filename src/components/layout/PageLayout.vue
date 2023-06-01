<template>
  <div :class="['container', 'pkt-grid', `pkt-grid--${breakpoint}`]">
    <aside
      v-if="$slots.sidebar"
      :class="[
        'container__sidebar',
        { 'container__sidebar--right': sidebarPosition === 'right' },
        'pkt-cell',
        'pkt-cell--span12',
        `pkt-cell--span${sidebarCols}-${sidebarBreakpoint}-up`,
        { widgets: sidebarGrid },
      ]"
    >
      <slot name="sidebar" />
    </aside>

    <main
      v-if="$slots.default"
      :class="[
        'container__main',
        'pkt-cell',
        'pkt-cell--span12',
        $slots.sidebar
          ? `pkt-cell--span${12 - sidebarCols}-${sidebarBreakpoint}-up`
          : null,
      ]"
    >
      <slot name="default" />
    </main>
  </div>
</template>

<script>
export default {
  name: 'PageLayout',

  props: {
    breakpoint: {
      type: String,
      default: 'desktop',
      validator: (value) =>
        ['phablet', 'tablet', 'tablet-big', 'laptop', 'desktop', 'full'].includes(value),
    },

    sidebarPosition: {
      type: String,
      default: 'right',
      validator: (value) => ['left', 'right'].includes(value),
    },

    sidebarCols: {
      type: Number,
      default: 3,
      validator: (value) => value <= 12,
    },

    sidebarBreakpoint: {
      type: String,
      default: 'tablet-big',
      validator: (value) =>
        ['phablet', 'tablet', 'tablet-big', 'laptop', 'desktop', 'full'].includes(value),
    },

    sidebarGrid: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.container {
  padding: 1.5rem;

  @each $bp-name, $padding in ('tablet-up': 2, 'laptop-up': 3.5) {
    @include bp('#{$bp-name}') {
      padding: #{$padding}rem 1.5rem;
    }
  }

  &__sidebar {
    &--right {
      order: 1;
    }
  }
}
</style>
