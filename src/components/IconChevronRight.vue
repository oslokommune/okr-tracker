<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    data-category="arrows"
    viewBox="0 0 32 32"
    :width="width"
    :height="height"
  >
    <path
      :fill="fill"
      fill-rule="evenodd"
      d="m25.1429 15.8571-10-10-4.2858 4.2858 5.7143 5.7142-5.7143 5.7143 4.2858 4.2857 10-10ZM8 10.1429 15.1429 3 28 15.8571 15.1429 28.7143 8 21.5714l5.7143-5.7143L8 10.1429Z"
      clip-rule="evenodd"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconChevronRight',

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
