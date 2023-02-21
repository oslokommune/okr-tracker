<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('keyResult.newValue') }}
    </template>

    <key-result-value-form
      :key-result="keyResult"
      :loading="loading"
      @save="saveProgress"
    />
  </modal-wrapper>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import KeyResultValueForm from '@/components/forms/KeyResultValueForm.vue';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'KeyResultModal',

  components: {
    ModalWrapper,
    KeyResultValueForm,
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    loading: false,
  }),

  methods: {
    close() {
      this.$emit('close');
    },

    async saveProgress(value, comment) {
      this.loading = true;
      try {
        await Progress.create(db.collection('keyResults'), this.keyResult.id, {
          value,
          comment,
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
