<template>
  <menu :class="['nav-menu', `nav-menu--${mode}`]">
    <slot />
  </menu>
</template>

<script>
export default {
  name: 'NavMenu',

  props: {
    mode: {
      type: String,
      default: 'vertical',
      validator: (value) => ['vertical', 'horizontal'].includes(value),
    },
  },
};
</script>
