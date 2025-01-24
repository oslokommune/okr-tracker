<template>
  <div v-if="$slots.default" class="pane-layout">
    <template v-for="(pane, i) in $slots.default()" :key="`pane${i}`">
      <Transition name="slide-fade">
        <component :is="pane" />
      </Transition>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.pane-layout {
  display: flex;
  flex-grow: 1;
  width: 100%;

  > .pane {
    display: none;
    flex: 1 1 auto;
    width: 0;
    height: 100%;
    overflow: auto;
    border-left: 1px solid var(--color-grayscale-20);

    &:nth-last-child(-n + 1) {
      display: block;
    }

    @include bp('laptop-up') {
      &:nth-last-child(-n + 2) {
        display: block;
      }
    }

    @media screen and (min-width: 135rem) {
      &:nth-last-child(-n + 3) {
        display: block;
      }
    }

    @media screen and (min-width: 180rem) {
      &:nth-last-child(-n + 4) {
        display: block;
      }
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.4s ease;
}
.slide-fade-leave-active {
  transition: none;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
