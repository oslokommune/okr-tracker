<template>
  <div class="grid">
    <admin-items class="admin-items"></admin-items>
    <div class="admin-users">
      <admin-access-requests v-if="requestAccess.length" />
      <admin-users />
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  name: 'Admin',

  components: {
    AdminAccessRequests: () => import('./components/AdminAccessRequests.vue'),
    AdminUsers: () => import('./components/AdminUsers.vue'),
    AdminItems: () => import('./components/AdminItems.vue'),
  },

  data: () => ({
    requestAccess: [],
  }),

  firestore: {
    requestAccess: db.collection('requestAccess'),
  },
};
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-gap: span(0, 1);
  grid-template-columns: repeat(12, 1fr);

  @media screen and (min-width: bp(m)) {
    grid-gap: span(0, 1, span(9));
    grid-template-columns: repeat(9, 1fr);
  }

  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(10));
    grid-template-columns: repeat(10, 1fr);
  }
}

.admin-items {
  grid-row: 2;
  grid-column: 1 / span 12;

  @media screen and (min-width: bp(m)) {
    grid-row: 1;
    grid-column: 1 / span all;
  }

  @media screen and (min-width: bp(l)) {
    grid-column: 1 / span 8;
  }

  @media screen and (min-width: bp(xl)) {
    grid-column: 1 / span 7;
  }
}

.admin-users {
  grid-row: 1;
  grid-column: 1 / span 12;

  @media screen and (min-width: bp(m)) {
    grid-row: 2;
    grid-column: 1 / span all;
  }

  @media screen and (min-width: bp(l)) {
    grid-row: 1;
    grid-column: 8 / span 3;
  }
}
</style>
