<template>
  <section
    :class="[
      'widget',
      `widget--${size}`,
      { 'widget--collapsable': collapsable },
      collapsable ? `widget--${show ? 'open' : 'collapsed'}` : '',
    ]"
  >
    <button
      v-if="collapsable"
      v-tooltip="show ? $t('btn.minimize') : $t('btn.expand')"
      class="btn btn--ter widget__toggle"
      @click="toggle"
    >
      <i :class="['fa', `fa-chevron-${show ? 'up' : 'down'}`]" />
    </button>

    <header
      v-if="$slots.header || title"
      class="widget__header"
      v-on="collapsable ? { click: toggle } : {}"
    >
      <slot v-if="$slots.header" name="header" />
      <h3 v-else :class="size === 'small' ? 'title-3' : 'title-2'">
        {{ title }}
      </h3>
    </header>

    <div v-if="$slots.default && show" class="widget__body">
      <slot />
    </div>

    <footer v-if="$slots.footer && show" class="widget__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script>
export default {
  name: 'WidgetWrapper',

  props: {
    title: {
      type: String,
      required: false,
      default: null,
    },
    collapsable: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: String,
      required: false,
      default: 'large',
      validator: (value) => ['large', 'small'].includes(value),
    },
  },

  data: () => ({
    show: true,
  }),

  methods: {
    toggle() {
      this.show = !this.show;
    },
  },
};
</script>

<style lang="scss" scoped>
.widget {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background-color: var(--color-white);

  &__toggle {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
  }

  &__header {
    .title-2,
    .title-3 {
      margin-bottom: 0;
      color: var(--color-text);
    }
  }

  &__body {
    flex-grow: 1;
  }

  &--collapsable {
    .widget__header {
      cursor: pointer;
    }
  }

  &--small {
    padding: 1rem;

    .widget__toggle {
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.5rem;
    }
  }
}
</style>
