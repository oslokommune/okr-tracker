<template>
  <section
    :class="[
      'widget',
      `widget--${size}`,
      { 'widget--collapsable': collapsable },
      collapsable ? `widget--${show ? 'open' : 'collapsed'}` : '',
    ]"
  >
    <header
      v-if="$slots.header || title"
      class="widget__header"
      v-on="collapsable ? { click: toggle } : {}"
    >
      <slot v-if="$slots.header" name="header" />
      <h3 v-else :class="size === 'small' ? 'pkt-txt-16-medium' : 'pkt-txt-18-medium'">
        {{ title }}
      </h3>

      <pkt-button
        v-if="collapsable"
        v-tooltip="show ? $t('btn.minimize') : $t('btn.expand')"
        class="widget__toggle"
        size="small"
        skin="tertiary"
        variant="icon-only"
        :icon-name="show ? 'chevron-thin-up' : 'chevron-thin-down'"
      />
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
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'WidgetWrapper',

  components: {
    PktButton,
  },

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
  border: 2px solid var(--color-border);

  &__header {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    h3 {
      margin-bottom: 0;
      color: var(--color-text);
    }

    .widget__toggle {
      margin-left: auto;
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
  }
}
</style>
