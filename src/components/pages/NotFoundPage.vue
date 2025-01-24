<script setup>
import EmptyPage from '@/components/pages/EmptyPage.vue';
import i18n from '@/locale/i18n';

defineProps({
  heading: {
    type: String,
    required: false,
    default: i18n.global.t('notFound.title'),
  },
  body: {
    type: String,
    required: false,
    default: i18n.global.t('notFound.body'),
  },
  backTo: {
    type: Object,
    required: false,
    default: null,
  },
  backText: {
    type: String,
    required: false,
    default: i18n.global.t('notFound.linkText'),
  },
});
</script>

<template>
  <EmptyPage :heading="heading" :body="body" skin="warning">
    <RouterLink v-if="backTo" :to="backTo" class="pkt-link">
      <PktIcon class="pkt-link__icon" name="chevron-left" />
      {{ backText }}
    </RouterLink>
  </EmptyPage>
</template>
