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
import * as Toast from '../../util/toasts';

export default {
  name: 'CalloutArchivedRestore',

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
        .catch(err => {
          this.$errorHandler('restore_archived_error', err);
        });
    },
    deletePermanently() {
      this.docref
        .delete()
        .then(Toast.deletedPermanently)
        .catch(err => {
          this.$errorHandler('delete_archived_error', err);
        });
    },
  },
};
</script>
