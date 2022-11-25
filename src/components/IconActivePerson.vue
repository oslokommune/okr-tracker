<template>
  <svg :width="width" :height="height" viewBox="0 0 25 24">
    <path
      d="M12.9145 2.625C12.9145 3.66053 12.075 4.5 11.0395 4.5C10.004 4.5 9.1645 3.66053 9.1645 2.625C9.1645 1.58947 10.004 0.75 11.0395 0.75C12.075 0.75 12.9145 1.58947 12.9145 2.625Z"
      :fill="fill"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.1047 7.3125H20.8496V5.8125H5.84961V1.5H4.34961V7.3125H7.97475L7.36695 14.6044L5.1258 15.6316L4.72571 22.8333L6.2234 22.9165L6.5733 16.6182L10.5126 14.8127L11.9792 14.8128L17.618 22.5662L18.8311 21.6839L13.834 14.8129L14.7299 14.813L14.1047 7.3125ZM8.97978 13.3125L9.47966 7.3125H12.5998L13.0997 13.3125H8.97978Z"
      :fill="fill"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconActivePerson',

  props: {
    width: {
      type: Number,
      required: false,
      default: 25,
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
