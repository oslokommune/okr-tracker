<template>
  <menu :class="['menu', `menu--${mode}`]">
    <slot />
  </menu>
</template>

<script>
export default {
  name: 'MenuComponent',

  props: {
    mode: {
      type: String,
      default: 'vertical',
      validator: (value) => ['vertical', 'horizontal'].includes(value),
    },
  },
};
</script>
