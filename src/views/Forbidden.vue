<template>
  <div>
    <empty-state :icon="'ban'" :heading="$t('403.title')" :body="$t('403.body')">
      <router-link class="btn btn--ter" :to="{ name: 'Home' }">
        {{ $t('403.linkText') }}
      </router-link>
    </empty-state>
  </div>
</template>

<script>
import i18n from '@/locale/i18n';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'Forbidden',
  components: {
    EmptyState,
  },

  metaInfo() {
    return {
      title: `${i18n.t('403.title')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>
