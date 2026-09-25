<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import '@oslokommune/punkt-elements/dist/pkt-alert.js';

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
  <pkt-alert :title="$t('archived.heading')" skin="warning" class="archived-alert">
    <div class="archived-alert__body">
      <p v-if="text">{{ text }}</p>
      <p v-else>
        {{ $t(`archived.body.${objectType}`) }} {{ $t('archived.restoreText') }}
      </p>

      <pkt-button
        v-if="hasEditRights"
        skin="secondary"
        variant="icon-left"
        iconName="arrow-circle"
        @click="restore"
      >
        <span>{{ $t('btn.restore') }}</span>
      </pkt-button>
    </div>
  </pkt-alert>
</template>

<style lang="scss" scoped>
.archived-alert__body {
  display: flex;
  flex-direction: column;

  pkt-button {
    align-self: end;
    margin-top: 1rem;
  }
}
</style>
