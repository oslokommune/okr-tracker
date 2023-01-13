<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    fill="none"
    data-category="ui"
    viewBox="0 0 32 32"
  >
    <circle cx="16" cy="16" r="15" :fill="fill" />
    <path
      fill="var(--fg-color, #2A2859)"
      d="m23.704 12.214-9.707 9.707-5.707-5.707L9.704 14.8l4.293 4.293L22.29 10.8l1.414 1.414Z"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconAlertSuccess',

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
      default: 'var(--bg-color, #43F8B6)',
    },
  },
};
</script>
