<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.75 9.09451V3H5.25V9.09451C6.54392 9.42755 7.5 10.6021 7.5 12C7.5 13.3979 6.54392 14.5725 5.25 14.9055V21H3.75V14.9055C2.45608 14.5725 1.5 13.3979 1.5 12C1.5 10.6021 2.45608 9.42755 3.75 9.09451ZM6 12C6 12.8284 5.32843 13.5 4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12Z"
      :fill="fill"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.25 8.90549V21H12.75V8.90549C14.0439 8.57245 15 7.39788 15 6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6C9 7.39788 9.95608 8.57245 11.25 8.90549ZM13.5 6C13.5 6.82843 12.8284 7.5 12 7.5C11.1716 7.5 10.5 6.82843 10.5 6C10.5 5.17157 11.1716 4.5 12 4.5C12.8284 4.5 13.5 5.17157 13.5 6Z"
      :fill="fill"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22.5 18C22.5 16.6021 21.5439 15.4275 20.25 15.0945V3H18.75V15.0945C17.4561 15.4275 16.5 16.6021 16.5 18C16.5 19.6569 17.8431 21 19.5 21C21.1569 21 22.5 19.6569 22.5 18ZM19.5 19.5C20.3284 19.5 21 18.8284 21 18C21 17.1716 20.3284 16.5 19.5 16.5C18.6716 16.5 18 17.1716 18 18C18 18.8284 18.6716 19.5 19.5 19.5Z"
      :fill="fill"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconFiltrer',

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
