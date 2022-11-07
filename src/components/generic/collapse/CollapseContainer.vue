<template>
  <div :class="['collapse', `collapse--${show ? 'open' : 'collapsed'}`]">
    <div class="collapse__header" @click="show = !show">
      <div class="collapse__header-content">
        <slot name="collapse-header" />
      </div>
      <button class="btn btn--ter collapse__toggle">
        <i :class="['fa', `fa-chevron-${show ? 'up' : 'down'}`]" />
      </button>
    </div>
    <div v-if="show" class="collapse__body">
      <slot name="collapse-body" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapseContainer',

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

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  }
}
</style>
