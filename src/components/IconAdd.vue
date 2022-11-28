<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 32 32"
  >
    <g :fill="fill">
      <path
        d="M16 3a13 13 0 1 1 0 26 13 13 0 0 1 0-26Zm0-2a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z"
      ></path>
      <path d="M23 15h-6V9h-2v6H9v2h6v6h2v-6h6v-2Z"></path>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'IconAdd',

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
