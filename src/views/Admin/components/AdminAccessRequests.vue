<template>
  <div v-if="accessRequest.length" class="access-requests">
    <h2 class="title-2">{{ $t('accessRequests.heading') }}</h2>

    <ul class="access-requests__list">
      <li
        v-for="request in accessRequest"
        :key="request.id"
        class="access-requests__item"
      >
        <div class="access-requests__email">{{ request.email }}</div>

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
      </li>
    </ul>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';
import { db } from '@/config/firebaseConfig';
import api from '@/util/api';
import { showToastMessage } from '@/util/toastUtils';
// eslint-disable-next-line import/no-relative-packages
import AccessRequestCollection from '../../../../functions/backend/utils/collectionUtils/AccessRequestCollection.js';

const accessRequestCollection = new AccessRequestCollection(db);

export default {
  name: 'AdminAccessRequests',

  components: {
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
  margin: 0 0 1.5rem;
}

.access-requests__item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
  padding: 1rem;
  background: var(--color-green);
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba(var(--color-grayscale-50-rgb), 0.5);
}

.access-requests__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.access-requests__email {
  font-weight: 500;
}
</style>
