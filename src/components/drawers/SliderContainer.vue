<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="isVisible" class="overlay" @click.self="clickOutside"></div>
    </transition>
    <transition name="slide" @after-leave="$emit('close')">
      <aside v-if="isVisible" class="sliderContainer">
        <div class="sliderContainer__closeButtonContainer">
          <pkt-button
            skin="tertiary"
            variant="icon-only"
            icon-name="close"
            @onClick="close"
          />
        </div>

        <div class="sliderContainer__inner">
          <header v-if="$slots.header" class="sliderContainer__header">
            <slot name="header" />
          </header>

          <div class="sliderContainer__content">
            <slot name="default" />
          </div>

          <footer v-if="$slots.footer" class="sliderContainer__footer">
            <slot name="footer" />
          </footer>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'SliderContainer',

  components: {
    PktButton,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

    allowClickOutside: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data: () => ({
    isVisible: false,
  }),

  watch: {
    visible: {
      immediate: true,
      handler() {
        this.isVisible = this.visible;
      },
    },
  },

  methods: {
    clickOutside() {
      if (this.allowClickOutside) {
        this.close();
      }
    },

    close() {
      this.isVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.sliderContainer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 37.5rem;
  height: 100vh;
  background-color: var(--color-white);

  @include bp('phablet-up') {
    width: calc(100vw - 4rem);
  }

  &__closeButtonContainer {
    margin: 0.5rem;
    text-align: right;

    @include bp('phablet-up') {
      margin: 1rem 1rem 0;
    }

    svg {
      --fg-color: var(--color-primary);
      height: 1.5rem;
    }
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
    padding: 1.5rem;
    padding-top: 0;
    overflow-y: auto;

    @include bp('phablet-up') {
      padding: 2.5rem;
    }
  }

  &__footer {
    margin-top: auto;
  }
}

.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.25s ease-out;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.slide {
  &-enter-active,
  &-leave-active {
    transition: right 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    right: -504px;
  }
}
</style>
