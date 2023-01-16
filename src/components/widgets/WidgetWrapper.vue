<template>
  <section class="widget">
    <header class="widget__header">
      <span class="widget__title">{{ title }}</span>
    </header>
    <div class="widget__body">
      <slot></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'WidgetWrapper',

  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
