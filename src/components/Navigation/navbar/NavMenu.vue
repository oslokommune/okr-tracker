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

<script>
export default {
  name: 'NavMenu',

  props: {
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
  },
};
</script>
