<template>
  <div v-if="accessRequest.length" class="access-requests">
    <h2 class="title-2">{{ $t('accessRequests.heading') }}</h2>

    <ul class="access-requests__list">
      <li v-for="request in accessRequest" :key="request.id" class="access-requests__item">
        <div class="access-requests__email">{{ request.email }}</div>

        <div class="access-requests__actions">
          <button
            :disabled="isProcessingAccessRequest"
            class="btn btn--ghost"
            data-cy="request-accept"
            @click="acceptRequest(request)"
          >
            {{ $t('btn.acceptRequest') }}
          </button>
          <button
            :disabled="isProcessingAccessRequest"
            class="btn btn--ghost"
            data-cy="request-reject"
            @click="rejectRequest(request)"
          >
            {{ $t('btn.rejectRequest') }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { api } from '@/util';
import { showToastMessage } from '@/util/toastUtils';
import AccessRequestCollection from '../../../../functions/backend/utils/collectionUtils/AccessRequestCollection.js';

const accessRequestCollection = new AccessRequestCollection(db);

export default {
  name: 'AdminAccessRequests',

  data: () => ({
    accessRequest: [],
    isProcessingAccessRequest: false,
  }),

  firestore: {
    accessRequest: accessRequestCollection.getCollection(),
  },

  methods: {
    showToastMessage(res, accessRequest, toastType) {
      showToastMessage({
        msg: res.data,
        msgVars: { user: accessRequest.email },
        type: toastType,
      });
    },
    async handleAccessRequest(method, url, accessRequest) {
      this.isProcessingAccessRequest = true;

      try {
        const res = await api.request({ method, url });
        this.showToastMessage(res, accessRequest, 'success');
      } catch (error) {
        this.showToastMessage(error.response, accessRequest, 'error');
      }

      this.isProcessingAccessRequest = false;
    },
    acceptRequest(accessRequest) {
      this.handleAccessRequest('post', `/accessRequests/${accessRequest.id}/accept`, accessRequest);
    },

    rejectRequest(accessRequest) {
      this.handleAccessRequest('delete', `/accessRequests/${accessRequest.id}`, accessRequest);
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
  box-shadow: 0 2px 3px rgba(var(--color-grey-500-rgb), 0.5);
}

.access-requests__actions {
  display: flex;
  margin: 0.25rem -0.25rem -0.25rem;

  & > .btn {
    margin: 0.25rem;
  }
}

.access-requests__email {
  font-weight: 500;
}
</style>
