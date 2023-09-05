<template>
  <div ref="modalOverlay" class="overlay" @keydown.esc="close">
    <div :class="['modal', `modal--${variant}`]">
      <div class="modal__header">
        <h1 class="pkt-txt-18-medium">
          <slot name="header" />
        </h1>
        <pkt-button
          ref="closeButton"
          size="small"
          variant="icon-only"
          icon-name="close"
          skin="tertiary"
          @onClick="close"
        />
      </div>

      <div ref="modalContent" class="modal__content">
        <slot />
      </div>

      <div v-if="$slots.footer" class="modal__footer">
        <slot name="footer" />
      </div>

      <div v-if="$slots.subfooter" class="modal__subfooter">
        <slot name="subfooter" />
      </div>
    </div>
  </div>
</template>

<script>
import { focusable } from 'tabbable';
import * as focusTrap from 'focus-trap';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ModalWrapper',

  components: {
    PktButton,
  },

  props: {
    variant: {
      type: String,
      required: false,
      default: 'normal',
      validator: (value) => ['normal', 'wide'].includes(value),
    },

    initialFocus: {
      type: Boolean,
      required: false,
      default: true,
    },

    clickOutside: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    focusTrap: null,
  }),

  mounted() {
    this.$nextTick(this.createFocusTrap);
  },

  beforeDestroy() {
    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }
  },

  methods: {
    close() {
      this.$emit('close');
    },

    createFocusTrap() {
      this.focusTrap = focusTrap.createFocusTrap(this.$refs.modalOverlay, {
        initialFocus: this.initialFocus,
        onActivate: this.initialFocus ? this.setInitialFocus : null,
        allowOutsideClick: true,
      });
      this.focusTrap.activate();
    },

    setInitialFocus() {
      const focusableElement =
        focusable(this.$refs.modalContent)[0] || this.$refs.closeButton;
      focusableElement.focus();
    },
  },
};
</script>
