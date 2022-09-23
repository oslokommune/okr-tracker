<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('keyResult.newValue') }}
    </template>

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

    <template #footer>
      <button form="modal" :disabled="loading" class="btn btn--ods">
        {{ $t('btn.saveChanges') }}
      </button>
    </template>
  </modal-wrapper>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'KeyResultModal',

  components: {
    ModalWrapper,
  },

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
::v-deep .modal {
  max-width: 350px;
}
</style>
