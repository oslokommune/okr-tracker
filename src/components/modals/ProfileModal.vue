<script setup>
import UserProfile from '@/components/UserProfile.vue';
import ModalWrapper from './ModalWrapper.vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>

<template>
  <ModalWrapper variant="wide" @close="$emit('close')">
    <template #header>
      {{ $t('user.profile') }}
    </template>

    <template #default>
      <UserProfile :user-id="props.id" />
    </template>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
:deep(.user-profile > div:first-child > .title-2) {
  display: none;
}
</style>
