<template>
  <empty-page :heading="$t('404.title')" :body="$t('404.body')" skin="warning">
    <router-link :to="{ name: 'Home' }">
      {{ $t('404.linkText') }}
    </router-link>
  </empty-page>
</template>

<script>
import i18n from '@/locale/i18n';
import EmptyPage from '@/components/pages/EmptyPage.vue';

export default {
  name: 'NotFound',
  components: {
    EmptyPage,
  },

  metaInfo() {
    return {
      title: `${i18n.t('404.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
