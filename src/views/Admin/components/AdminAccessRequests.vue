<template>
  <div v-if="requestAccess.length" class="access-requests">
    <h2 class="title-2">{{ $t('accessRequests.heading') }}</h2>

    <ul class="access-requests__list">
      <li v-for="request in requestAccess" :key="request.id" class="access-requests__item">
        <div class="access-requests__email">{{ request.email }}</div>

        <div class="access-requests__actions">
          <button :disabled="accepting" class="btn btn--ghost" data-cy="request-accept" @click="acceptRequest(request)">
            {{ $t('btn.acceptRequest') }}
          </button>
          <button :disabled="rejecting" class="btn btn--ghost" data-cy="request-reject" @click="rejectRequest(request)">
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

export default {
  name: 'AdminAccessRequests',

  data: () => ({
    requestAccess: [],
    accepting: false,
    rejecting: false,
  }),

  firestore: {
    requestAccess: db.collection('requestAccess'),
  },

  methods: {
    async acceptRequest(obj) {
      this.accepting = true;

      try {
        await api.post('/user/create', {
          email: obj.email,
          id: obj.email,
        });

        await api.delete(`/access/${obj.id}`);
        this.$toasted.show(this.$t('toaster.request.accepted', { user: obj.email }));
      } catch (e) {
        console.log(e.response);
      }

      this.accepting = false;
    },

    async rejectRequest(obj) {
      this.rejecting = true;

      try {
        await api.delete(`/access/${obj.id}`);
        this.$toasted.show(this.$t('toaster.request.rejected', { user: obj.email }));
      } catch (e) {
        this.$toasted.error(e.response.data);
      }

      this.rejecting = false;
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
