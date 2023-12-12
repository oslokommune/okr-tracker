<template>
  <slider-container
    :visible="visible"
    :class="[
      'paged-drawer',
      { 'paged-drawer--done': isDone },
      skin ? `paged-drawer--${skin}` : null,
    ]"
    :allow-click-outside="isDone"
    @close="$emit('close')"
  >
    <template #header>
      <span
        v-if="pageCount > 1 && !isDone"
        class="paged-drawer__step-indicator pkt-txt-16-medium"
      >
        {{ $t('general.step', { step: pageIndex, steps: pageCount }) }}
      </span>
      <h1 class="paged-drawer__title">
        <slot name="title" v-bind="slotProps" />
      </h1>
    </template>

    <template #default>
      <slot v-if="!isDone" name="page" v-bind="slotProps" />
      <slot v-else name="done" v-bind="slotProps" />
    </template>

    <template #footer>
      <slot name="footer" v-bind="slotProps">
        <clapping-hands v-if="isDone && isSuccess" class="paged-drawer__graphic" />
      </slot>
    </template>
  </slider-container>
</template>

<script>
import ClappingHands from '@/components/ClappingHands.vue';
import SliderContainer from '@/components/drawers/SliderContainer.vue';

export default {
  name: 'PagedDrawerWrapper',

  components: {
    SliderContainer,
    ClappingHands,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

    pageCount: {
      type: Number,
      required: false,
      default: 1,
    },
  },

  data: () => ({
    pageIndex: 1,
    skin: null,
    isDone: false,
  }),

  computed: {
    slotProps() {
      return {
        pageIndex: this.pageIndex,
        pageCount: this.pageCount,
        isDone: this.isDone,
        isSuccess: this.isSuccess,
        next: this.next,
        prev: this.prev,
        reset: this.reset,
      };
    },

    isSuccess() {
      return this.isDone && this.skin === 'success';
    },
  },

  methods: {
    next(success) {
      if (success !== false && this.pageIndex < this.pageCount) {
        this.pageIndex += 1;
      } else {
        this.pageIndex = this.pageCount + 1;
        this.isDone = true;
        this.skin = success !== false ? 'success' : 'error';
      }
    },

    prev() {
      if (this.pageIndex > 1) {
        this.pageIndex -= 1;
      }
    },

    goToPage(pageIndex) {
      if (pageIndex !== this.pageIndex && pageIndex >= 1 && pageIndex <= this.pageCount) {
        this.pageIndex = pageIndex;
      }
    },

    reset() {
      this.isDone = false;
      this.skin = null;
      this.pageIndex = 1;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.paged-drawer {
  &--done {
    ::v-deep .sliderContainer__footer {
      margin: auto -2.5rem -2.5rem;
    }
  }
  &--done#{&}--success {
    ::v-deep .sliderContainer {
      background-color: var(--color-green-light);
    }
  }
  &--done#{&}--error {
    ::v-deep .sliderContainer {
      background-color: var(--color-red-30);
    }
  }

  &__title {
    @include get-text('pkt-txt-22-medium');

    @include bp('phablet-up') {
      @include get-text('pkt-txt-30-medium');
    }
  }

  &__step-indicator {
    color: var(--color-grayscale-60);
  }

  &__graphic {
    display: block;
  }
}
</style>
