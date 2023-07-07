<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="visible" class="overlay" @click.self="close"></div>
    </transition>
    <transition name="slide" @after-leave="$emit('hidden')">
      <aside v-if="visible" class="sliderContainer">
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
  },

  methods: {
    close(e) {
      this.$emit('close', e);
    },
  },
};
</script>

<style lang="scss" scoped>
.sliderContainer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 4rem);
  max-width: 37.5rem;
  height: 100vh;
  background-color: var(--color-white);

  &__closeButtonContainer {
    margin: 1rem;
    text-align: right;

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
    padding: 2.5rem;
    padding-top: 0;
    overflow-y: auto;
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
