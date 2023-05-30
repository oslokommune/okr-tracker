<template>
  <button
    :form="form"
    :type="type"
    :aria-label="label"
    :class="['btn', { 'btn--icon': icon }, buttonVariantClass]"
    :disabled="disabled"
    @click="clickHandler"
  >
    <i v-if="icon" :class="['icon', 'fa', 'fa-fw', `fa-${icon}`]" />
    <span v-if="!hideLabel">{{ label }}</span>
  </button>
</template>

<script>
export default {
  name: 'BtnBase',

  props: {
    form: {
      type: String,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: false,
      default: 'button',
    },
    label: {
      type: String,
      required: true,
      default: null,
    },
    hideLabel: {
      type: Boolean,
      required: false,
      default: false,
    },
    variant: {
      type: String,
      required: false,
      default: 'primary',
    },
    icon: {
      type: String,
      required: false,
      default: null,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    buttonVariantClass() {
      switch (this.variant) {
        case 'primary':
          return 'btn--pri';
        case 'secondary':
          return 'btn--sec';
        case 'tertiary':
          return 'btn--ter';
        default:
          return 'btn--pri';
      }
    },
  },

  methods: {
    clickHandler(e) {
      if (!this.form) {
        e.preventDefault();
      }
      this.$emit('click', e);
    },
  },
};
</script>
