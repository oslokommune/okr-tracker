<template>
  <not-found-page back-to="Home" />
</template>

<script>
import i18n from '@/locale/i18n';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

export default {
  name: 'NotFound',
  components: {
    NotFoundPage,
  },

  metaInfo() {
    return {
      title: `${i18n.t('notFound.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
