<script setup>
import UserProfile from '@/components/UserProfile.vue';
import ModalWrapper from './ModalWrapper.vue';

defineProps({
  userId: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <ModalWrapper variant="wide">
    <template #header>
      {{ $t('user.profile') }}
    </template>

    <template #default>
      <UserProfile :user-id="userId" no-title />
    </template>
  </ModalWrapper>
</template>
