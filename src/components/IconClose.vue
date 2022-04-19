<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    data-category="ui"
    viewBox="0 0 32 32"
    :width="width"
    :height="height"
  >
    <path
      :fill="fill"
      d="M14.533 16 5 6.467 6.467 5 16 14.533 25.533 5 27 6.467 17.467 16 27 25.533 25.533 27 16 17.467 6.467 27 5 25.533 14.533 16Z"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconClose',

  props: {
    width: {
      type: Number,
      required: false,
      default: 32,
    },
    height: {
      type: Number,
      required: false,
      default: 32,
    },
    fill: {
      type: String,
      required: false,
      default: 'var(--color-white)',
    },
  },
};
</script>
