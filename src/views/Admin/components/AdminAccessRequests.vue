<script setup>
import { ref } from 'vue';
import { useCollection } from 'vuefire';
import { collection } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import '@oslokommune/punkt-elements/dist/pkt-alert.js';
import { db } from '@/config/firebaseConfig';
import api from '@/util/api';

const i18n = useI18n();
const toast = useToast();

const accessRequests = useCollection(collection(db, 'requestAccess'));
const loading = ref(false);

async function handleAccessRequest(method, path, accessRequest) {
  loading.value = true;
  const { email } = accessRequest;

  try {
    const { message } = await api(path, { method });
    toast.success(i18n.t(message, { user: email }) || message);
  } catch (error) {
    toast.error(i18n.t(error.message, { user: email }) || error.message);
  }

  loading.value = false;
}

function acceptRequest(request) {
  handleAccessRequest('post', `/accessRequests/${request.id}/accept`, request);
}

function rejectRequest(request) {
  handleAccessRequest('delete', `/accessRequests/${request.id}`, request);
}
</script>

<template>
  <div v-if="accessRequests.length" class="access-requests">
    <h2 class="title-2">
      {{ $t('accessRequests.heading') }} ({{ accessRequests.length }})
    </h2>

    <div class="access-requests__list">
      <pkt-alert
        v-for="request in accessRequests"
        :key="request.id"
        :title="request.email"
      >
        <div class="access-requests__actions">
          <pkt-button
            :disabled="loading"
            skin="secondary"
            size="small"
            @click="acceptRequest(request)"
          >
            <span>{{ $t('btn.acceptRequest') }}</span>
          </pkt-button>
          <pkt-button
            :disabled="loading"
            skin="secondary"
            size="small"
            @click="rejectRequest(request)"
          >
            <span>{{ $t('btn.rejectRequest') }}</span>
          </pkt-button>
        </div>
      </pkt-alert>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.access-requests {
  :deep(.pkt-alert__title) {
    word-break: break-all;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0 0 1.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
