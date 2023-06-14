<template>
  <empty-page :heading="$t('403.title')" :body="$t('403.body')" skin="error">
    <router-link :to="{ name: 'Home' }" class="pkt-link">
      <pkt-icon class="pkt-link__icon" name="chevron-left" />
      {{ $t('403.linkText') }}
    </router-link>
  </empty-page>
</template>

<script>
import i18n from '@/locale/i18n';
import EmptyPage from '@/components/pages/EmptyPage.vue';

export default {
  name: 'Forbidden',
  components: {
    EmptyPage,
  },

  metaInfo() {
    return {
      title: `${i18n.t('403.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
