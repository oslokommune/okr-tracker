<script setup>
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';
import { useActiveItemStore } from '@/store/activeItem';
import '@oslokommune/punkt-elements/dist/pkt-loader.js';
import '@oslokommune/punkt-elements/dist/pkt-alert.js';

const { item, isLoading } = storeToRefs(useActiveItemStore());

useHead({ title: () => item.value?.name });
</script>

<template>
  <pkt-loader v-if="isLoading" size="large" :delay="500" inline />

  <template v-else-if="!isLoading && item">
    <pkt-alert v-if="item.archived" skin="warning" size="small">
      {{ $t('archived.heading') }}
    </pkt-alert>
    <RouterView />
  </template>
</template>
