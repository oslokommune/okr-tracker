<template>
  <div class="overlay" @click.self="close">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">
          <slot name="header" />
        </h2>
        <button
          class="btn btn--ter btn--close btn--icon btn--icon-pri"
          @click="close"
        >
          <i class="fa fa-times" />
        </button>
      </div>

      <slot />

      <div class="modal__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalWrapper',

  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
