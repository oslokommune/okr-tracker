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

<style lang="scss" scoped>
.widget__body {
  padding: 1.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 0 1.5rem 1.5rem;
  }
}
</style>
