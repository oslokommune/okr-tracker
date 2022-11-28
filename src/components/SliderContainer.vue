<template>
  <div :class="{ overlay: isOpen }" @click.self="toggle">
    <transition :name="transitionName">
      <aside
        v-if="isOpen"
        class="sliderContainer"
        :class="{
          'sliderContainer--shouldSlideInFromLeft': shouldSlideInFromLeft,
          'sliderContainer--hasPrimaryBackground': hasPrimaryBackground,
        }"
      >
        <div class="sliderContainer__closeButtonContainer">
          <button
            class="btn"
            :class="{
              'btn--pri': hasPrimaryBackground,
              'btn--ter': !hasPrimaryBackground,
            }"
            @click.stop="toggle"
          >
            <icon-close :width="22" :height="22" :fill="iconFillColor" />
          </button>
        </div>
        <div class="sliderContainer__content">
          <slot />
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
import IconClose from '@/components/IconClose.vue';

export default {
  name: 'SliderContainer',

  components: {
    IconClose,
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    hasPrimaryBackground: {
      type: Boolean,
      required: false,
      default: false,
    },
    shouldSlideInFromLeft: {
      type: Boolean,
      required: true,
    },
    toggle: {
      type: Function,
      required: true,
    },
  },

  computed: {
    transitionName() {
      return this.shouldSlideInFromLeft
        ? 'shouldSlideInFromLeft'
        : 'shouldSlideInFromRight';
    },
    iconFillColor() {
      return this.hasPrimaryBackground
        ? 'var(--color-white)'
        : 'var(--primary-color, #2A2859)';
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
  width: calc(100vw - 4rem);
  max-width: 36rem;
  height: 100vh;
  background-color: var(--color-white);

  &--hasPrimaryBackground {
    background-color: var(--color-primary);
  }

  &--shouldSlideInFromLeft {
    left: 0;
  }

  &__closeButtonContainer {
    padding: 1rem;
    text-align: right;
  }

  &__content {
    overflow-y: auto;

    scrollbar-width: none; /* Hide scrollbar styles Firefox */
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.shouldSlideInFromLeft-enter-active,
.shouldSlideInFromLeft-leave-active {
  transition: left 0.25s ease-in-out;
}

.shouldSlideInFromLeft-enter,
.shouldSlideInFromLeft-leave-to {
  left: -504px;
}

.shouldSlideInFromRight-enter-active,
.shouldSlideInFromRight-leave-active {
  transition: right 0.25s ease-in-out;
}

.shouldSlideInFromRight-enter,
.shouldSlideInFromRight-leave-to {
  right: -504px;
}
</style>
