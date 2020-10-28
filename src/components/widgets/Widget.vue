<template>
  <section class="widget">
    <header class="widget__header">
      <span class="widget__icon fas fa-fw" :class="`fa-${icon}`"></span>
      <span class="widget__title">{{ title }}</span>
      <button
        v-if="collapsible"
        v-tooltip="isOpen ? $t('btn.minimize') : $t('btn.expand')"
        class="widget__toggle fas fa-fw"
        :class="isOpen ? 'fa-minus' : 'fa-plus'"
        @click="toggle"
      ></button>
    </header>
    <div v-show="isOpen" class="widget__body">
      <slot></slot>
    </div>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Widget',

  props: {
    widgetId: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    collapsible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  computed: {
    ...mapState(['user']),
    isOpen() {
      try {
        const [namespace, name] = this.widgetId.split('.');
        return this.user.preferences.widgets[namespace][name];
      } catch {
        return true;
      }
    },
  },

  methods: {
    ...mapActions(['update_preferences']),
    toggle() {
      const [namespace, name] = this.widgetId.split('.');
      this.user.preferences.widgets[namespace][name] = !this.user.preferences.widgets[namespace][name];
      this.update_preferences();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.widget {
  align-self: start;
  width: 100%;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid $color-grey-100;
}

.widget__header {
  position: relative;
  display: flex;
  align-items: baseline;
  padding: 0.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 1rem 1rem 0.75rem;
  }
}

.widget__title {
  font-weight: 500;
}

.widget__toggle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: auto;
  margin-left: auto;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.widget__icon {
  margin-right: 0.25rem;
}

.widget__body {
  padding: 0.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 0 1rem 1rem;
  }
}
</style>
