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
import AdminAccessRequests from './components/AdminAccessRequests.vue';
import AdminItems from './components/AdminItems.vue';
import AdminUsers from './components/AdminUsers.vue';

export default {
  name: 'Admin',

  components: {
    AdminAccessRequests,
    AdminUsers,
    AdminItems,
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
