<script setup>
import { provide } from 'vue';

const props = defineProps({
  vertical: {
    type: Boolean,
    default: false,
  },
  tabs: {
    type: Boolean,
    default: false,
  },
  toggles: {
    type: Boolean,
    default: false,
  },
});

provide('isVerticalMenu', props.vertical);
</script>

<template>
  <ul
    :class="[
      'nav-menu',
      { 'nav-menu--vertical': vertical },
      { 'nav-menu--tabs': tabs },
      { 'nav-menu--toggles': toggles },
    ]"
    role="menu"
  >
    <slot />
  </ul>
</template>
