<template>
  <div class="overlay">
    <div class="modal modal__key-result">
      <div class="modal__header">
        <h2 class="title-2" style="text-transform: uppercase">{{ $t('keyResult.newValue') }}</h2>
        <button class="btn btn--ter btn--close btn--icon btn--icon-pri" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>
      <validation-observer v-slot="{ handleSubmit }">
        <form id="modal" @submit.prevent="handleSubmit(saveProgress)">
          <label>
            <span class="title-4">{{ $t('keyResult.addComment') }}</span>
            <textarea
              v-model="note"
              class="modal__textarea"
              style="margin-top: 0.5rem"
              :placeholder="$t('keyResult.commentPlaceholder')"
              rows="3"
            />
          </label>

          <div>
            <validation-provider v-slot="{ errors }" name="value" rules="required">
              <label class="form-group">
                <span class="form-label">{{ $t('keyResult.newValue') }}</span>
                <input v-model="value" style="margin-top: 0.25rem" type="number" step="any" />
                <span class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>
          </div>
        </form>
      </validation-observer>
      <div class="modal__footer">
        <button form="modal" :disabled="loading" class="btn btn--ods">{{ $t('btn.saveChanges') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';

export default {
  name: 'KeyResultModal',

  props: {
    keyResult: {
      type: Object,
      required: true,
    }
  },

  data: () => ({
    note: '',
    value: 0,
    loading: false,
  }),

  watch: {
    keyResult: {
      immediate: true,
      async handler() {
        this.value = this.keyResult.currentValue || this.keyResult.startValue || 0;
      },
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async saveProgress() {
      this.loading = true;
      try {
        await Progress.create(db.collection('keyResults'), this.keyResult.id, {
          value: +this.value,
          comment: this.note,
          timestamp: new Date(),
        });
        this.$toasted.show(this.$t('toaster.add.progression'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.progression'));
      }
      this.loading = false;
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.btn--space {
  margin-left: 1rem;
}

.modal__key-result {
  max-width: 350px;
}

.btn--close {
  height: 3rem;
}
</style>
