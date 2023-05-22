<template>
  <div>
    <empty-state :icon="'meh'" :heading="$t('404.title')" :body="$t('404.body')">
      <router-link :to="{ name: 'Home' }">
        {{ $t('404.linkText') }}
      </router-link>
    </empty-state>
  </div>
</template>

<script>
import i18n from '@/locale/i18n';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'NotFound',
  components: {
    EmptyState,
  },

  metaInfo() {
    return {
      title: `${i18n.t('404.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
