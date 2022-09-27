<template>
  <div
    ref="modalOverlay"
    class="overlay"
    @keydown.esc="close"
    @click.self="close"
  >
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">
          <slot name="header" />
        </h2>
        <button
          ref="closeButton"
          class="btn btn--ter btn--close btn--icon btn--icon-pri"
          @click="close"
        >
          <i class="fa fa-times" />
        </button>
      </div>

      <div ref="modalContent" class="modal__content">
        <slot />
      </div>

      <div class="modal__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
import * as focusTrap from 'focus-trap';

export default {
  name: 'ModalWrapper',

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
      });
      this.focusTrap.activate();
    },
    setInitialFocus() {
      const focusableElement =
        this.$refs.modalContent.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )[0] || this.$refs.closeButton;
      focusableElement.focus();
    },
  },
};
</script>
