<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    data-category="ui"
    viewBox="0 0 32 32"
    :width="width"
    :height="height"
  >
    <g :fill="fill">
      <path d="M16 16a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Z" />
      <path
        d="M1 16C1 7.716 7.716 1 16 1c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15Zm10.693 4-2.618 6.983A12.91 12.91 0 0 0 16 29a12.91 12.91 0 0 0 6.925-2.017L20.307 20h-8.614Zm10-2 2.899 7.73C27.288 23.346 29 19.873 29 16c0-7.168-5.832-13-13-13S3 8.832 3 16c0 3.873 1.712 7.346 4.408 9.73L10.307 18h11.386Z"
      />
    </g>
  </svg>
</template>

<script>
export default {
  name: 'IconUser',

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
