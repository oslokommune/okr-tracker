<script setup>
import UserProfile from '@/components/UserProfile.vue';
import ModalWrapper from './ModalWrapper.vue';

defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<template>
  <ModalWrapper variant="wide" @close="close">
    <template #header>
      {{ $t('user.profile') }}
    </template>

    <template #default>
      <UserProfile :user-id="userId" no-title @save="close" />
    </template>
  </ModalWrapper>
</template>
