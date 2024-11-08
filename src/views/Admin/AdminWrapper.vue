<script setup>
import { useHead } from 'unhead';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useHead({
  title: `${t('general.admin')} | ${t('general.project')}`,
});
</script>

<template>
  <RouterView />
</template>
