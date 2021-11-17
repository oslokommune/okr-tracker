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
.widget {
  align-self: start;
  width: 100%;
  margin-bottom: 0.5rem;
  background: var(--color-white);
}

.widget__header {
  position: relative;
  display: flex;
  align-items: baseline;
  padding: 1.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 1.5rem;
  }
}

.widget__title {
  font-weight: 500;
  text-transform: uppercase;
  word-break: break-all;
}

.widget__toggle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: auto;
  margin-left: auto;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.widget__icon {
  margin-right: 0.25rem;
}

.widget__body {
  padding: 1.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 0 1.5rem 1.5rem;
  }
}
</style>
