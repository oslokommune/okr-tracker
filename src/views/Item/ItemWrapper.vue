<script setup>
import { storeToRefs } from 'pinia';
import { useActiveItemStore } from '@/store/activeItem';
import { PktAlert, PktLoader } from '@oslokommune/punkt-vue';

const { item, isLoading } = storeToRefs(useActiveItemStore());
</script>

<template>
  <PktLoader v-if="isLoading" size="large" :delay="500" inline />
  <template v-else-if="!isLoading && item">
    <PktAlert v-if="item.archived" skin="warning" compact>
      {{ $t('archived.heading') }}
    </PktAlert>
    <RouterView />
  </template>
</template>

<style lang="scss" scoped>
.pkt-loader--inline {
  margin: auto auto;
}
</style>
