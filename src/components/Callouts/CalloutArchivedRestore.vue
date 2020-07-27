<template>
  <div class="callout">
    <div class="callout__message">{{ $t('callout.archivedRestore.message') }}</div>
    <div class="callout__actions">
      <button @click="restore" class="btn btn--borderless">
        <i class="fa far fa-trash-undo"></i>
        {{ $t('toaster.callout.restore') }}
      </button>
      <button @click="deletePermanently" class="btn btn--borderless" data-cy="permanently-delete-object">
        <i class="far fa-trash-alt"></i>
        {{ $t('toaster.callout.delete') }}
      </button>
    </div>
  </div>
</template>

<script>
import * as Toast from '@/util/toasts';

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
