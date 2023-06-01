<template>
  <div :class="['collapse', `collapse--${show ? 'open' : 'collapsed'}`]">
    <div class="collapse__header" @click="show = !show">
      <div class="collapse__header-content">
        <slot name="collapse-header" />
      </div>
      <pkt-button
        size="small"
        skin="tertiary"
        variant="icon-only"
        :icon-name="show ? 'chevron-thin-up' : 'chevron-thin-down'"
      />
    </div>

    <div v-if="show" class="collapse__body">
      <slot name="collapse-body" />
    </div>

    <div class="collapse__footer">
      <slot name="collapse-footer" />
    </div>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'CollapseContainer',

  components: {
    PktButton,
  },

  props: {
    // When `true`, expands the collapse.
    visible: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    show: false,
  }),

  watch: {
    visible(newValue) {
      this.show = newValue;
    },
    show(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit('toggle', newValue);
      }
    },
  },

  mounted() {
    this.show = this.visible;
  },
};
</script>

<style lang="scss" scoped>
.collapse {
  &__header {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    cursor: pointer;
  }

  &__header-content {
    flex-grow: 1;
  }
}
</style>
