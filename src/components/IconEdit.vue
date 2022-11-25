<template>
<svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 32 32">
  <g :fill="fill">
    <path fill-rule="evenodd" d="M31.283 6.256 25.639.611 9.176 17.073l-1.96 7.585 7.586-1.958 1.164-1.165 11.205-11.17.002.001.868-.868.546-.545 2.696-2.697Zm-5.645-2.818 2.816 2.817-1.282 1.282-2.816-2.816 1.282-1.283ZM12.655 16.42l2.8 2.8L25.757 8.95l-2.815-2.816L12.655 16.42Zm-1.414 1.414 2.799 2.798-.267.267-3.773.974.975-3.773.266-.266Z" clip-rule="evenodd"></path>
    <path d="M13.5 4.024v-2H.017V30h31.98l-.007-12.09h-2L29.994 28H2.015V4.024h11.486Z"></path>
  </g>
</svg>
</template>

<script>
export default {
  name: 'IconEdit',

  props: {
    width: {
      type: Number,
      required: false,
      default: 24,
    },
    height: {
      type: Number,
      required: false,
      default: 24,
    },
    fill: {
      type: String,
      required: false,
      default: 'var(--color-primary)',
    },
  },
};
</script>
