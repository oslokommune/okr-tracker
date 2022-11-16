<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M15.75 16.5C16.9926 16.5 18 15.4926 18 14.25C18 13.0074 16.9926 12 15.75 12C14.5074 12 13.5 13.0074 13.5 14.25C13.5 15.4926 14.5074 16.5 15.75 16.5Z"
      fill="#2A2859"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M18.75 1.5V3.75H21.75V22.5H2.25V3.75H5.25V1.5H6.75V3.75H17.25V1.5H18.75ZM20.25 8.25V5.25H3.75V8.25H20.25ZM3.75 9.75V21H20.25V9.75H3.75Z"
      fill="#2A2859"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconCalendar',

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
