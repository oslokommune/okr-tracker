<template>
  <empty-page :heading="$t('notFound.title')" :body="$t('notFound.body')" skin="warning">
    <router-link :to="{ name: 'Home' }" class="pkt-link">
      <pkt-icon class="pkt-link__icon" name="chevron-left" />
      {{ $t('notFound.linkText') }}
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
      title: `${i18n.t('notFound.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
