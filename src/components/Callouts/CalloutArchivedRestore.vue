<template>
  <div class="callout">
    <div class="callout__message">Dette produktet er arkivert</div>
    <div class="callout__actions">
      <button @click="restore" class="btn btn--borderless"><i class="fa far fa-trash-undo"></i>Gjenopprett</button>
      <button @click="deletePermanently" class="btn btn--borderless">
        <i class="far fa-trash-alt"></i>Slett permanent
      </button>
    </div>
  </div>
</template>

<script>
import * as Toast from '@/util/toasts';

export default {
  props: {
    docref: {
      type: Object,
      required: true,
    },
  },

  methods: {
    restore() {
      this.docref
        .update({ archived: false })
        .then(Toast.restored)
        .catch(Toast.error);
    },
    deletePermanently() {
      this.docref
        .delete()
        .then(Toast.deletedPermanently)
        .catch(Toast.error);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.callout {
  display: grid;
  grid-gap: 0;
  grid-template-areas:
    'message'
    'actions';
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  margin: 2rem 0 1.5rem;
  padding: 0 1.25rem;
  background: rgba($color-bg, 0.6);
  border-left: 6px solid $color-yellow;
  // box-shadow: 0 2px 5px rgba($color-grey-800, 0.5);

  &__icon {
    grid-area: icon;
    color: darken($color-yellow, 10%);
    font-size: 2rem;
  }

  &__actions {
    display: flex;
    margin-left: -1rem;
    padding: 0.5rem 0;
    border-top: 1px solid $color-border;
  }

  &__message {
    grid-area: message;
    padding: 1.25rem 0;
    font-weight: 500;
    font-size: 1rem;
  }
}
</style>
