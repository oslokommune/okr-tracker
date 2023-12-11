<template>
  <div class="pane">
    <div class="pane__inner">
      <div class="pane__header">
        <div v-if="title || $slots.title" class="pane__title">
          <slot name="title">
            <h1 class="pkt-txt-18-medium">{{ title }}</h1>
          </slot>
        </div>

        <div class="pane__actions">
          <slot name="actions" />
          <pkt-button
            v-if="closable"
            v-tooltip="$t('btn.close')"
            variant="icon-only"
            skin="tertiary"
            size="medium"
            icon-name="close"
            @onClick="$emit('close')"
          />
        </div>
      </div>

      <div class="pane__body">
        <slot name="default" />
      </div>
    </div>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'PaneWrapper',

  components: {
    PktButton,
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    closable: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.pane {
  &__inner {
    display: flex;
    flex-direction: column;
    height: 0;
  }

  &__header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;

    @include bp('laptop-up') {
      padding-bottom: 0;
    }
  }

  &__title {
    min-width: 0;
    padding: 1rem 0;

    @include bp('phablet-up') {
      padding-left: 1rem;
    }

    @include bp('tablet-up') {
      padding-left: 2rem;
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    white-space: nowrap;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem 3rem;

    @include bp('phablet-up') {
      padding-right: 1.5rem;
      padding-left: 1.5rem;
    }

    @include bp('tablet-up') {
      padding-right: 2.5rem;
      padding-left: 2.5rem;
    }
  }
}
</style>
