<template>
  <svg :width="width" :height="height" viewBox="0 0 15 15">
    <path
      d="M14.5 4V0.5H11V1.5H12.7978L8.692 5.605L4.37745 1.23044L1.58645 4.02145L2.29355 4.72855L4.3725 2.6495L8.68755 7.02456L13.5 2.21211V4H14.5Z"
      :fill="fill"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.135 6.5H1.55V14.5H0.5V15.5H15.5V14.5H14.445V7H10.86V14.5H9.79V9H6.205V14.5H5.135V6.5ZM11.86 14.5H13.445V8H11.86V14.5ZM8.79 10V14.5H7.205V10H8.79ZM4.135 14.5V7.5H2.55V14.5H4.135Z"
      :fill="fill"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconGraph',

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
