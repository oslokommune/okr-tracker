<template>
  <div :class="['empty', `empty--${skin}`]">
    <div class="empty__wrapper">
      <h1 v-if="heading" class="empty__heading" v-text="heading" />
      <p v-if="body" class="empty__body" v-text="body" />

      <div v-if="$slots.default" class="empty__actions">
        <slot />
      </div>
    </div>

    <div v-if="showGraphic" class="empty__footer">
      <buildings-graphic :skin="skin" class="empty__graphic" />
    </div>
  </div>
</template>

<script>
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';

export default {
  name: 'EmptyState',

  components: {
    BuildingsGraphic,
  },

  props: {
    heading: {
      type: String,
      required: false,
      default: '',
    },

    body: {
      type: String,
      required: false,
      default: '',
    },

    skin: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value),
    },

    showGraphic: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/variables';

$-empty-state-skins: (
  info: var(--color-blue-10),
  success: var(--color-green-10),
  warning: var(--color-yellow-50),
  error: var(--color-red-5),
);

.empty {
  @each $skin, $color in $-empty-state-skins {
    &--#{$skin} {
      background-color: $color;
    }
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    max-width: map.get(variables.$breakpoints, 'phablet');
    margin-right: auto;
    margin-left: auto;
    padding: 2rem 1.5rem;
    text-align: center;

    @include bp('tablet-up') {
      gap: 1.5rem;
    }

    @each $bp-name, $padding in ('tablet-up': 4.5, 'laptop-up': 5.5) {
      @include bp('#{$bp-name}') {
        padding: #{$padding}rem 1.5rem;
        padding-bottom: 1.5rem;
      }
    }
  }

  &__heading {
    @include get-text('pkt-txt-28-medium');

    @include bp('tablet-up') {
      @include get-text('pkt-txt-30-medium');
    }

    @include bp('laptop-up') {
      @include get-text('pkt-txt-36-medium');
    }
  }

  &__body {
    @include bp('tablet-up') {
      @include get-text('pkt-txt-20');
    }
  }

  &__actions {
    margin-top: 1rem;
  }

  &__graphic {
    display: block;
  }

  &__footer {
    display: flex;
    padding: 0 1.5rem;

    @include bp('tablet-up') {
      padding: 0 10%;
    }
  }
}
</style>
