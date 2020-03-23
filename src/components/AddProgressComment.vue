<template>
  <div class="modal-wrapper">
    <div class="overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="title-2">Legg til kommentar</h2>
          <button class="btn btn--borderless" @click="closeModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal__main">
          <textarea class="textarea" v-model="content"></textarea>
          <button class="btn" @click="save">Lagre</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    content: '',
  }),

  props: {
    documentRef: {
      type: Object,
      default: () => ({}),
    },
  },

  methods: {
    closeModal() {
      this.$emit('close');
    },
    save() {
      this.documentRef
        .update({
          comment: this.content,
        })
        .then(this.closeModal);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_modal.scss';

.textarea {
  grid-row: 1 / 4;
  grid-column: 1 / -1;
}

.btn {
  grid-row: 4;
  grid-column: 1;
  justify-self: start;
}
</style>
