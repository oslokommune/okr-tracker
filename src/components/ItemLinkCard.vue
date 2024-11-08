<script setup>
import { computed, getCurrentInstance } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  route: {
    type: Object,
    required: false,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: false,
    default: null,
  },
  iconName: {
    type: String,
    required: false,
    default: 'chevron-right',
  },
  size: {
    type: String,
    required: false,
    default: 'small',
    validator(value) {
      return ['large', 'medium', 'small'].includes(value);
    },
  },
  centered: {
    type: Boolean,
    required: false,
    default: false,
  },
  transparent: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const hasClickEventListener = computed(
  () => !!getCurrentInstance()?.vnode.props?.onClick
);

const component = computed(() => (hasClickEventListener.value ? 'button' : RouterLink));
const componentProps = computed(() => {
  return hasClickEventListener.value ? {} : { to: props.route };
});
</script>

<template>
  <component
    :is="component"
    v-bind="componentProps"
    :class="[
      'item-linkcard',
      `item-linkcard--${size}`,
      { 'item-linkcard--centered': centered },
      { 'item-linkcard--transparent': transparent },
    ]"
    tabindex="0"
  >
    <PktIcon v-if="!centered" class="item-linkcard__icon" :name="iconName" />
    <div class="item-linkcard__title">
      <PktIcon v-if="centered" class="item-linkcard__icon" :name="iconName" />
      <span>{{ title }}</span>
    </div>
    <div v-if="text" class="item-linkcard__text">
      {{ text }}
    </div>
  </component>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.item-linkcard {
  $self: &;
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: min-content auto;
  align-items: center;
  padding: 0.5rem 1.5rem;
  color: var(--pkt-color-text-action-normal);
  text-decoration: none;
  background-color: var(--pkt-color-brand-neutrals-white);
  border: 2px solid transparent;

  &:focus {
    border-color: var(--pkt-color-button-border-focus);
    outline: 4px solid var(--pkt-color-border-states-focus);
  }

  &__icon {
    margin-right: 0.5rem;
  }

  &__title {
    display: flex;
    grid-column: 2;
    align-items: center;
    @include get-text('pkt-txt-16-medium');
  }

  &__text {
    grid-column: 2;
    margin-top: 0.25rem;
    text-align: left;
    @include get-text('pkt-txt-14');
  }

  &--centered,
  &--centered &__title {
    justify-content: center;
  }

  &--centered &__text {
    text-align: center;
  }

  &--transparent {
    background-color: transparent;
  }

  &--medium {
    padding: 0.75rem 1.5rem;
  }

  &--large {
    align-items: center;
    padding: 1rem 1.5rem;

    #{$self}__title {
      @include get-text('pkt-txt-18-medium');

      @include bp('phablet-up') {
        @include get-text('pkt-txt-22-medium');

        .pkt-icon {
          height: 1.5rem;
        }
      }

      @include bp('tablet-up') {
        @include get-text('pkt-txt-28-medium');
      }

      @include bp('laptop-up') {
        @include get-text('pkt-txt-30-medium');
      }
    }

    #{$self}__text {
      @include bp('phablet-up') {
        @include get-text('pkt-txt-16');
      }

      @include bp('tablet-up') {
        @include get-text('pkt-txt-18');
      }
    }
  }

  &:hover {
    color: var(--pkt-color-text-action-active) !important;
    cursor: pointer;

    #{$self}__title {
      text-decoration: underline;
    }
  }
}
</style>
