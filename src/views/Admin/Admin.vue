<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import AdminAccessRequests from './components/AdminAccessRequests.vue';
import AdminItems from './components/AdminItems.vue';
import AdminUsers from './components/AdminUsers.vue';

const { isSuperAdmin } = storeToRefs(useAuthStore());
</script>

<template>
  <PageLayout>
    <div class="pkt-grid">
      <AdminItems class="pkt-cell pkt-cell--span12 pkt-cell--span8-laptop-up" />
      <div class="admin-users pkt-cell pkt-cell--span12 pkt-cell--span4-laptop-up">
        <AdminAccessRequests v-if="isSuperAdmin" />
        <AdminUsers />
      </div>
    </div>
  </PageLayout>
</template>

<style lang="scss" scoped>
.admin-users {
  order: -1;

  @include bp('tablet-up') {
    order: initial;
  }
}
</style>
