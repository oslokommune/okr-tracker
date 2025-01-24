<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';

defineProps({
  restore: {
    type: Function,
    required: true,
  },
  objectType: {
    type: String,
    required: false,
    default: null,
  },
  text: {
    type: String,
    required: false,
    default: null,
  },
});

const { hasEditRights } = storeToRefs(useAuthStore());
</script>

<template>
  <PktAlert :title="$t('archived.heading')" skin="warning" class="archived-alert">
    <div class="archived-alert__body">
      <p v-if="text">{{ text }}</p>
      <p v-else>
        {{ $t(`archived.body.${objectType}`) }} {{ $t('archived.restoreText') }}
      </p>

      <PktButton
        v-if="hasEditRights"
        skin="secondary"
        variant="icon-left"
        icon-name="arrow-circle"
        @on-click="restore"
      >
        {{ $t('btn.restore') }}
      </PktButton>
    </div>
  </PktAlert>
</template>

<style lang="scss" scoped>
.archived-alert__body {
  display: flex;
  flex-direction: column;

  .pkt-btn {
    align-self: end;
    margin-top: 1rem;
  }
}
</style>
