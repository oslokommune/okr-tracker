<script setup>
import { provide, ref } from 'vue';
import { useMenuItem } from './menuItem.js';

const props = defineProps({
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
    default: null,
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
});

const emit = defineEmits(['click']);
const menuItem = ref(null);
const { attrs, listeners, close, isOpen } = useMenuItem(props, menuItem, emit);

provide('closeNavMenuDropdown', close);
</script>

<template>
  <li
    ref="menuItem"
    :class="[
      'nav-menu-item',
      { 'nav-menu-item--dropdown': dropdown },
      { 'nav-menu-item--open': isOpen },
    ]"
    role="presentation"
  >
    <RouterLink
      v-if="route"
      v-slot="{ href, navigate, isExactActive }"
      :to="route"
      custom
    >
      <a
        v-bind="attrs"
        :href="href"
        :class="[
          'nav-menu-item__inner',
          { 'nav-menu-item__inner--icon-only': icon && !text },
          { 'nav-menu-item__inner--active': active === null ? isExactActive : active },
        ]"
        @keyup.space.capture.stop="(e) => listeners.click(e, navigate)"
        @click.capture.stop="(e) => listeners.click(e, navigate)"
        v-on="listeners"
      >
        <slot name="text">
          <PktIcon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="text" class="nav-menu-item__text">{{ text }}</span>
        </slot>
      </a>
    </RouterLink>

    <template v-else>
      <div
        v-bind="attrs"
        :class="[
          'nav-menu-item__inner',
          { 'nav-menu-item__inner--active': active || isOpen },
        ]"
        v-on="listeners"
      >
        <slot name="text">
          <PktIcon v-if="icon" class="nav-menu-item__icon" :name="icon" />
          <span v-if="text" class="nav-menu-item__text">{{ text }}</span>
        </slot>
        <PktIcon
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
