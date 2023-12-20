<template>
  <li
    v-click-outside="close"
    :class="[
      'nav-menu-item',
      { 'nav-menu-item--dropdown': dropdown },
      { 'nav-menu-item--open': isOpen },
    ]"
    role="none"
  >
    <router-link
      v-if="route"
      v-slot="{ href, navigate, isExactActive }"
      :to="route"
      :role="role"
      custom
    >
      <a
        :href="href"
        :class="[
          'nav-menu-item__inner',
          { 'nav-menu-item__inner--icon-only': icon && !text },
          { 'nav-menu-item__inner--active': active || isExactActive },
        ]"
        v-bind="ariaAttrs"
        @click="activate($event, navigate)"
      >
        <slot name="text">
          <pkt-icon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="text" class="nav-menu-item__text">{{ text }}</span>
        </slot>
      </a>
    </router-link>

    <template v-else>
      <div
        :class="[
          'nav-menu-item__inner',
          { 'nav-menu-item__inner--active': active || isOpen },
        ]"
        :role="role"
        tabindex="0"
        :aria-haspopup="dropdown"
        :aria-expanded="isOpen"
        v-bind="ariaAttrs"
        @click="activate"
        @keyup.enter="activate"
      >
        <slot name="text">
          <pkt-icon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="text" class="nav-menu-item__text">{{ text }}</span>
        </slot>
        <pkt-icon
          v-if="dropdown"
          class="nav-menu-item__toggle"
          :name="isOpen ? 'chevron-thin-up' : 'chevron-thin-down'"
        />
      </div>

      <div v-if="isOpen" class="nav-menu-item__content">
        <slot :close="close" />
      </div>
    </template>
  </li>
</template>

<script>
import vClickOutside from 'v-click-outside';

export default {
  name: 'NavMenuItem',

  directives: {
    clickOutside: vClickOutside.directive,
  },

  props: {
    dropdown: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      required: false,
      default: null,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
    route: {
      type: Object,
      required: false,
      default: null,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    role: {
      type: String,
      required: false,
      default: 'menuitem',
    },
    aria: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    isOpen: false,
  }),

  computed: {
    ariaAttrs() {
      return this.aria
        ? Object.fromEntries(Object.entries(this.aria).map(([k, v]) => [`aria-${k}`, v]))
        : null;
    },
  },

  watch: {
    isOpen() {
      this.$emit('open');
    },
  },

  methods: {
    activate(e, routeHandler) {
      if (this.dropdown) {
        this.isOpen = !this.isOpen;
        return;
      }
      if (routeHandler) {
        routeHandler(e);
        return;
      }
      this.$emit('click', e);
    },

    close() {
      this.isOpen = false;
    },
  },
};
</script>
