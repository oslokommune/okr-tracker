<template>
  <not-found-page back-to="Home" />
</template>

<script>
import i18n from '@/locale/i18n';

export default {
  name: 'NotFound',
  components: {
    NotFoundPage: () => import('@/components/pages/NotFoundPage.vue'),
  },

  metaInfo() {
    return {
      title: `${i18n.t('notFound.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
