<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'keyResult.editValue' : 'keyResult.newValue') }}
    </template>

    <ProgressValueForm
      v-model:value="thisRecord.value"
      v-model:comment="thisRecord.comment"
      v-model:timestamp="thisRecord.timestamp"
      :loading="loading"
      :enable-delete="!!record"
      :enable-time="true"
      @submit="saveRecord"
      @delete="deleteRecord"
    />
  </modal-wrapper>
</template>

<script>
import ProgressValueForm from '@/components/forms/ProgressValueForm.vue';
import ModalWrapper from '../ModalWrapper.vue';
import { useProgressModal } from './progressModal.js';

export default {
  name: 'ProgressModal',

  compatConfig: { MODE: 3 },

  components: {
    ModalWrapper,
    ProgressValueForm,
  },

  props: {
    record: {
      type: Object,
      required: false,
      default: null,
    },
  },

  emits: ['create-record', 'update-record', 'delete-record', 'close'],

  setup(props, context) {
    const { thisRecord, loading, saveRecord, deleteRecord, close } = useProgressModal(
      props,
      context
    );
    return { thisRecord, loading, saveRecord, deleteRecord, close };
  },
};
</script>
