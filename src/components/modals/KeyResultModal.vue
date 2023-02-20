<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('keyResult.newValue') }}
    </template>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="modal" @submit.prevent="handleSubmit(saveProgress)">
        <label class="form-field">
          <span class="form-label">{{ $t('keyResult.addComment') }}</span>
          <textarea
            v-model="note"
            class="modal__textarea"
            :placeholder="$t('keyResult.commentPlaceholder')"
            rows="3"
          />
        </label>

        <div>
          <validation-provider
            v-slot="{ errors }"
            name="value"
            rules="required"
          >
            <label class="form-field">
              <span class="form-label">{{ $t('keyResult.newValue') }}</span>
              <input v-model="value" type="number" step="any" />
              <span class="form-field--error">{{ errors[0] }}</span>
            </label>
          </validation-provider>
        </div>
      </form>
    </validation-observer>

    <template #footer>
      <btn-save form="modal" :disabled="loading" />
    </template>
  </modal-wrapper>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import ModalWrapper from './ModalWrapper.vue';
import { BtnSave } from '@/components/generic/form/buttons';

export default {
  name: 'KeyResultModal',

  components: {
    ModalWrapper,
    BtnSave,
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
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
        this.value =
          this.keyResult.currentValue || this.keyResult.startValue || 0;
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
        this.$toasted.show(this.$t('toaster.add.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.addProgress'));
      }
      this.loading = false;
      this.$emit('close');
    },
  },
};
</script>
