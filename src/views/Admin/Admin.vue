<template>
  <page-layout>
    <div class="pkt-grid">
      <admin-items class="pkt-cell pkt-cell--span12 pkt-cell--span8-laptop-up" />
      <div class="admin-users pkt-cell pkt-cell--span12 pkt-cell--span4-laptop-up">
        <admin-access-requests v-if="user.superAdmin" />
        <admin-users />
      </div>
    </div>
  </page-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Admin',

  components: {
    AdminAccessRequests: () => import('./components/AdminAccessRequests.vue'),
    AdminUsers: () => import('./components/AdminUsers.vue'),
    AdminItems: () => import('./components/AdminItems.vue'),
  },

  computed: {
    ...mapState(['user']),
  },
};
</script>

<style lang="scss" scoped>
.admin-users {
  order: -1;

  @include bp('tablet-up') {
    order: initial;
  }
}
</style>
