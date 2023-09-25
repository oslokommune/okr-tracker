<template>
  <div class="page">
    <header v-if="$slots.header" class="page__header">
      <slot name="header" />
    </header>

    <div :class="['page__container', 'pkt-grid', `pkt-grid--${breakpoint}`]">
      <main
        v-if="$slots.default"
        :class="[
          'page__main',
          'pkt-cell',
          'pkt-cell--span12',
          $slots.sidebar
            ? `pkt-cell--span${12 - sidebarCols}-${sidebarBreakpoint}-up`
            : null,
        ]"
      >
        <slot name="default" />
      </main>

      <aside
        v-if="$slots.sidebar"
        :class="[
          'page__sidebar',
          { 'page__sidebar--left': sidebarPosition === 'left' },
          'pkt-cell',
          'pkt-cell--span12',
          `pkt-cell--span${sidebarCols}-${sidebarBreakpoint}-up`,
          { widgets: sidebarGrid },
        ]"
      >
        <slot name="sidebar" />
      </aside>
    </div>

    <footer v-if="$slots.footer" class="page__footer">
      <slot name="footer" />
    </footer>
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

.page {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__header {
    padding: 1.5rem;
  }

  &__container {
    padding: 1.5rem;

    @each $bp-name, $padding in ('tablet-up': 2, 'laptop-up': 3.5) {
      @include bp('#{$bp-name}') {
        padding: #{$padding}rem 1.5rem;
      }
    }
  }

  &__footer {
    margin-top: auto;
  }

  &__sidebar {
    overflow-x: hidden;

    &--left {
      order: -1;
    }
  }
}
</style>
