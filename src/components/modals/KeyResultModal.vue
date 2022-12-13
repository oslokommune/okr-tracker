<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('keyResult.newValue') }}
    </template>

    <form-section>
      <form-component
        v-model="value"
        input-type="input"
        name="value"
        :label="$t('keyResult.newValue')"
        rules="required"
        type="number"
      />

      <form-component
        v-model="note"
        input-type="textarea"
        name="comment"
        :label="$t('keyResult.addComment')"
        :placeholder="$t('keyResult.commentPlaceholder')"
      />

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-save
          :disabled="submitDisabled || loading"
          @click="handleSubmit(saveProgress)"
        />
      </template>
    </form-section>
  </modal-wrapper>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import { FormSection, BtnSave } from '@/components/generic/form';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'KeyResultModal',

  components: {
    ModalWrapper,
    FormSection,
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

<style lang="scss" scoped>
::v-deep input[name='value'] {
  font-size: 1.5rem;
}
</style>
