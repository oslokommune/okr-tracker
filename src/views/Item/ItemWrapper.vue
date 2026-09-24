<script setup>
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';
import { useActiveItemStore } from '@/store/activeItem';
import { PktLoader } from '@oslokommune/punkt-vue';
import '@oslokommune/punkt-elements/dist/pkt-alert.js';

const { item, isLoading } = storeToRefs(useActiveItemStore());

useHead({ title: () => item.value?.name });
</script>

<template>
  <PktLoader v-if="isLoading" size="large" class="spinner__wrapper" :delay="500" inline />

  <template v-else-if="!isLoading && item">
    <pkt-alert v-if="item.archived" skin="warning" size="small">
      {{ $t('archived.heading') }}
    </pkt-alert>
    <RouterView />
  </template>
</template>
