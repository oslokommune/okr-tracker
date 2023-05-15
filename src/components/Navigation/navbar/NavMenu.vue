<template>
  <ul
    :class="['nav-menu', { 'nav-menu--vertical': vertical }, { 'nav-menu--tabs': tabs }]"
  >
    <slot />
  </ul>
</template>

<script>
export default {
  name: 'NavMenu',

  props: {
    tabs: {
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
