<template>
  <div class="toggle-button">
    <div class="toggle-button__container">
      <span v-if="$slots.label" class="toggle__label">
        <slot name="label" />
      </span>
      <span v-else-if="label" class="toggle__label">
        {{ label }}
      </span>
      <label class="toggle">
        <input v-model="toggleState" class="toggle__input" type="checkbox" />
        <span class="toggle__switch"></span>
      </label>
    </div>

    <div v-if="$slots.default && value" class="toggle-button__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToggleButton',

  props: {
    value: {
      required: true,
      type: Boolean,
    },
    label: {
      required: false,
      type: String,
      default: null,
    },
  },

  data() {
    return {
      toggleState: this.value,
    };
  },

  watch: {
    toggleState() {
      this.$emit('input', this.toggleState);
    },
  },
};
</script>
