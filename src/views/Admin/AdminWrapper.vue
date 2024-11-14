<script setup>
import { useHead } from '@unhead/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useHead({ title: t('general.admin') });
</script>

<template>
  <RouterView />
</template>
