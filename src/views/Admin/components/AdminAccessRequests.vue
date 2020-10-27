<template>
  <div class="access-requests">
    <h2 class="title-2">{{ $t('accessRequests.heading') }}</h2>

    <ul class="access-requests__list">
      <li v-for="request in requestAccess" :key="request.id" class="access-requests__item">
        <div class="access-requests__email">{{ request.email }}</div>

        <div class="access-requests__actions">
          <button class="btn btn--ghost" @click="acceptRequest(request)">{{ $t('btn.acceptRequest') }}</button>
          <button class="btn btn--ghost" @click="rejectRequest(request)">{{ $t('btn.rejectRequest') }}</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import requestAccess from '@/db/RequestAccess';
import * as Toast from '@/util/toasts';

export default {
  data: () => ({
    requestAccess: [],
  }),

  firestore: {
    requestAccess: db.collection('requestAccess'),
  },

  methods: {
    async acceptRequest(obj) {
      await requestAccess.accept(obj.id);
      Toast.show(this.$t('toaster.request.accepted', { user: obj.email }));
    },
    async rejectRequest(obj) {
      await requestAccess.reject(obj.id);
      Toast.error(this.$t('toaster.request.rejected', { user: obj.email }));
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/_colors.scss';

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
  background: $color-green;
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba($color-grey-500, 0.5);
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
