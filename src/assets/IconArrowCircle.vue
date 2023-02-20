<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" data-category="ui" viewBox="0 0 32 32" :width=width :height=height>
      <path :fill=fill d="m24.526 9.556 1.422-1.407A13.915 13.915 0 0 1 30 18c0 7.72-6.28 14-14 14S2 25.72 2 18C2 10.503 7.927 4.382 15.34 4.033V0L23 5l-7.66 5V6.033C9.031 6.379 4 11.606 4 18c0 6.617 5.383 12 12 12s12-5.383 12-12c0-3.183-1.233-6.182-3.474-8.444Z"/>
    </svg>
</template>

<script>
export default {
  name: 'IconArrowCircle',

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
  }
};
</script>
