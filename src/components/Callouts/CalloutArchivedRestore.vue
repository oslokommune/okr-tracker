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
import { errorHandler } from '../../util/utils';

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
        .catch(errorHandler);
    },
    deletePermanently() {
      this.docref
        .delete()
        .then(Toast.deletedPermanently)
        .catch(errorHandler);
    },
  },
};
</script>
