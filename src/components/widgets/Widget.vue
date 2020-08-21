<template>
  <section class="widget">
    <header class="widget__header">
      <span class="widget__icon fas fa-fw" :class="`fa-${icon}`"></span>
      <span class="widget__title">{{ title }}</span>
      <button
        class="widget__toggle fas fa-fw"
        :class="isOpen ? 'fa-minus' : 'fa-plus'"
        @click="isOpen = !isOpen"
      ></button>
    </header>
    <div class="widget__body" v-show="isOpen">
      <slot></slot>
    </div>
  </section>
</template>

<script>
export default {
  data: () => ({
    isOpen: true,
  }),

  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.widget {
  width: 100%;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid $color-grey-100;
  // border-radius: 4px;
  // box-shadow: 0 2px 3px rgba($color-grey-700, 0.2);
}

.widget__header {
  position: relative;
  display: flex;
  align-items: baseline;
  padding: 0.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 1rem 1rem 0.75rem;
  }
}

.widget__title {
  font-weight: 500;
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
  padding: 0.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 0 1rem 1rem;
  }
}
</style>
