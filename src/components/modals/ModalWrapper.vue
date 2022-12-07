<template>
  <div ref="modalOverlay" class="overlay" @keydown.esc="close" @click.self="close">
    <div :class="['modal', `modal--${variant}`]">
      <div class="modal__header">
        <h2 class="title-2">
          <slot name="header" />
        </h2>
        <button ref="closeButton" class="btn btn--ter btn--icon" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>

      <div ref="modalContent" class="modal__content">
        <slot />
      </div>

      <div v-if="$slots.footer" class="modal__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
import { focusable } from 'tabbable';
import * as focusTrap from 'focus-trap';

export default {
  name: 'ModalWrapper',

  props: {
    variant: {
      type: String,
      required: false,
      default: 'normal',
      validator: (value) => ['normal', 'wide'].includes(value),
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
        onActivate: this.setInitialFocus,
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
