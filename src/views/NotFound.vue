<template>
  <not-found-page back-to="Home" />
</template>

<script>
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

export default {
  name: 'NotFound',
  components: {
    NotFoundPage,
  },

  head() {
    return {
      title: `${this.$t('notFound.title')} | ${this.$t('general.project')}`,
    };
  },
};
</script>
