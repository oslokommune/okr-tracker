<!--
  XXX: Should be reverted to use `PktButton` again once this issue is resolved:
    https://github.com/oslokommune/punkt/issues/870
-->

<template>
  <button
    :type="type"
    class="pkt-btn"
    :class="variantClass"
    :disabled="disabled"
    @click="onClick"
  >
    <pkt-icon v-if="variant !== 'label-only'" class="pkt-btn__icon" name="save">
    </pkt-icon>
    <span class="pkt-btn__text">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'BtnSave',

  props: {
    type: {
      type: String,
      required: false,
      default: 'submit',
    },
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.save');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'icon-left',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    variantClass() {
      return this.variant !== 'label-only' ? `pkt-btn--${this.variant}` : '';
    },
  },

  methods: {
    onClick(e) {
      e.preventDefault();
      this.$emit('click', e);
    },
  },
};
</script>
