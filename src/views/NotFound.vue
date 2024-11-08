<script setup>
import { useTitle } from '@vueuse/core';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

const title = useTitle();
title.value = 'Not Found';
</script>

<template>
  <NotFoundPage :back-to="{ name: 'Home' }" />
</template>
