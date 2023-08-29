<template>
  <div class="pane">
    <div class="pane__inner">
      <div class="pane__header">
        <h1 class="pkt-txt-20-medium">{{ title }}</h1>

        <div class="pane__buttons">
          <slot name="actions" />
          <pkt-button
            v-if="closable"
            v-tooltip="$t('btn.close')"
            variant="icon-only"
            skin="tertiary"
            size="small"
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
      required: true,
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
    gap: 1rem;
    height: 0;
    padding: 1.5rem;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__buttons {
    display: flex;
    gap: 0.5rem;
  }

  &__actions {
    display: flex;
    gap: 1rem;
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
