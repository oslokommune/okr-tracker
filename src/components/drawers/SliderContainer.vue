<template>
  <div :class="{ overlay: drawer.show }" @click.self="toggle">
    <transition :name="transitionName">
      <aside
        v-if="drawer.show"
        class="sliderContainer"
        :class="{
          'sliderContainer--shouldSlideInFromLeft': shouldSlideInFromLeft,
          'sliderContainer--hasPrimaryBackground': hasPrimaryBackground,
          'sliderContainer--hasSuccessBackground': hasSuccessBackground,
        }"
      >
        <div class="sliderContainer__closeButtonContainer">
          <pkt-button
            :skin="hasPrimaryBackground ? 'primary' : 'tertiary'"
            variant="icon-only"
            icon-name="close"
            @onClick="toggle"
          />
        </div>
        <div class="sliderContainer__content">
          <slot />
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'SliderContainer',

  components: {
    PktButton,
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
    ...mapState(['drawer']),
    shouldSlideInFromLeft() {
      return this.drawer.placement === 'left';
    },
    hasPrimaryBackground() {
      return this.drawer.placement === 'left';
    },
    hasSuccessBackground() {
      return (
        this.drawer.type === 'savedObjective' || this.drawer.type === 'savedKeyResult'
      );
    },
    transitionName() {
      return this.shouldSlideInFromLeft
        ? 'shouldSlideInFromLeft'
        : 'shouldSlideInFromRight';
    },
  },

  methods: {
    ...mapMutations(['TOGGLE_DRAWER']),
    toggle() {
      store.commit('TOGGLE_DRAWER', '');
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
  max-width: 37.5rem;
  height: 100vh;
  background-color: var(--color-white);

  &--hasPrimaryBackground {
    background-color: var(--color-primary);
  }

  &--hasSuccessBackground {
    background-color: var(--color-green-light);
  }

  &--shouldSlideInFromLeft {
    left: 0;
  }

  &__closeButtonContainer {
    padding: 1rem;
    text-align: right;

    svg {
      --fg-color: var(--color-primary);
      height: 1.5rem;
    }
  }

  &--hasPrimaryBackground &__closeButtonContainer svg {
    --fg-color: var(--color-white);
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
