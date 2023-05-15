<template>
  <li
    v-click-outside="close"
    :class="[
      'nav-menu-item',
      { 'nav-menu-item--dropdown': dropdown },
      { 'nav-menu-item--open': isOpen },
    ]"
  >
    <router-link v-if="route" v-slot="{ href, navigate, isActive }" :to="route" custom>
      <a
        :href="href"
        :class="['nav-menu-item__inner', { 'nav-menu-item__inner--active': isActive }]"
        @click="activate($event, navigate)"
      >
        <slot name="label">
          <pkt-icon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="label" class="nav-menu-item__label">{{ label }}</span>
        </slot>
      </a>
    </router-link>

    <template v-else>
      <div
        :class="['nav-menu-item__inner', { 'nav-menu-item__inner--active': isOpen }]"
        tabindex="0"
        @click="activate"
        @keyup.enter="activate"
      >
        <slot name="label">
          <pkt-icon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="label" class="nav-menu-item__label">{{ label }}</span>
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
import ClickOutside from 'vue-click-outside';

export default {
  name: 'NavMenuItem',

  directives: {
    ClickOutside,
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
    label: {
      type: String,
      required: false,
      default: null,
    },
    route: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    isOpen: false,
  }),

  methods: {
    activate(e, handler) {
      if (!this.route) {
        this.isOpen = !this.isOpen;
        return;
      }
      if (handler) {
        handler(e);
        this.close();
      }
      this.$emit('click', e);
    },

    close() {
      this.isOpen = false;
    },
  },
};
</script>
