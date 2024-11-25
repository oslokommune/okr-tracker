<script setup>
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';
import { useActiveItemStore } from '@/store/activeItem';
import { PktAlert, PktLoader } from '@oslokommune/punkt-vue';

const { item, isLoading } = storeToRefs(useActiveItemStore());

useHead({ title: () => item.value?.name });
</script>

<template>
  <PktLoader v-if="isLoading" size="large" class="spinner__wrapper" :delay="500" inline />

  <template v-else-if="!isLoading && item">
    <PktAlert v-if="item.archived" skin="warning" compact>
      {{ $t('archived.heading') }}
    </PktAlert>
    <RouterView />
  </template>
</template>
