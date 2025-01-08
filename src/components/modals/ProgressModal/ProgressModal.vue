<script setup>
import ProgressValueForm from '@/components/forms/ProgressValueForm.vue';
import ModalWrapper from '../ModalWrapper.vue';
import { useProgressModal } from './progressModal.js';

const props = defineProps({
  record: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create-record', 'update-record', 'delete-record', 'close']);

const { thisRecord, loading, saveRecord, deleteRecord, close } = useProgressModal(
  props,
  emit
);
</script>

<template>
  <ModalWrapper variant="wide" @close="close">
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
  </ModalWrapper>
</template>
