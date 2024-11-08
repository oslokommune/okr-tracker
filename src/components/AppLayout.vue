<script setup>
import SiteHeader from './Navigation/SiteHeader.vue';

if (document.querySelector('#spinner')) {
  document.querySelector('#spinner').remove();
}
</script>

<template>
  <div class="app-wrapper">
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
