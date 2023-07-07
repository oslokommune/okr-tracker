<template>
  <div v-if="accessRequest.length" class="access-requests">
    <h2 class="title-2">{{ $t('accessRequests.heading') }}</h2>

    <div class="access-requests__list">
      <pkt-alert
        v-for="request in accessRequest"
        :key="request.id"
        :title="request.email"
      >
        <div class="access-requests__actions">
          <pkt-button
            :disabled="isProcessingAccessRequest"
            skin="secondary"
            data-cy="request-accept"
            @onClick="acceptRequest(request)"
          >
            {{ $t('btn.acceptRequest') }}
          </pkt-button>
          <pkt-button
            :disabled="isProcessingAccessRequest"
            skin="secondary"
            data-cy="request-reject"
            @onClick="rejectRequest(request)"
          >
            {{ $t('btn.rejectRequest') }}
          </pkt-button>
        </div>
      </pkt-alert>
    </div>
  </div>
</template>

<script>
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import { db } from '@/config/firebaseConfig';
import api from '@/util/api';
import { showToastMessage } from '@/util/toastUtils';
// eslint-disable-next-line import/no-relative-packages
import AccessRequestCollection from '../../../../functions/backend/utils/collectionUtils/AccessRequestCollection.js';

const accessRequestCollection = new AccessRequestCollection(db);

export default {
  name: 'AdminAccessRequests',

  components: {
    PktAlert,
    PktButton,
  },

  data: () => ({
    accessRequest: [],
    isProcessingAccessRequest: false,
  }),

  firestore: {
    accessRequest: accessRequestCollection.getCollection(),
  },

  methods: {
    showToastMessage(message, accessRequest, toastType) {
      showToastMessage({
        msg: message,
        msgVars: { user: accessRequest.email },
        type: toastType,
      });
    },
    async handleAccessRequest(method, path, accessRequest) {
      this.isProcessingAccessRequest = true;

      try {
        const { message } = await api(path, { method });
        this.showToastMessage(message, accessRequest, 'success');
      } catch (error) {
        this.showToastMessage(error.message, accessRequest, 'error');
      }

      this.isProcessingAccessRequest = false;
    },
    acceptRequest(accessRequest) {
      this.handleAccessRequest(
        'post',
        `/accessRequests/${accessRequest.id}/accept`,
        accessRequest
      );
    },

    rejectRequest(accessRequest) {
      this.handleAccessRequest(
        'delete',
        `/accessRequests/${accessRequest.id}`,
        accessRequest
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.access-requests__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 0 1.5rem;
}

.access-requests__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
