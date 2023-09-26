<template>
  <div class="pane">
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

    <div class="pane__inner">
      <div v-if="title" class="pane__header">
        <h1 class="pkt-txt-18-medium">{{ title }}</h1>
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
  position: relative;

  &__actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 0;
    padding: 1.5rem 2.5rem;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 3rem;
  }
}
</style>
