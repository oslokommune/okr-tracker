<script setup>
import { watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useTrackerStore } from '@/store/tracker';
import SiteHeader from './Navigation/SiteHeader.vue';

const { loading } = storeToRefs(useTrackerStore());

watchEffect(() => {
  // Remove initial app loader
  if (!loading.value && document.querySelector('#spinner')) {
    document.querySelector('#spinner').remove();
  }
});
</script>

<template>
  <div v-if="!loading" class="app-wrapper">
    <SiteHeader />

    <div class="router-view-wrapper">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.router-view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
