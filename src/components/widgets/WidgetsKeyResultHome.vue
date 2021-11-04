<template>
  <aside v-if="activeKeyResult" class="aside">
    <router-link
      v-if="hasEditRights"
      class="btn btn--ter btn--icon btn--icon-pri link__edit-rights"
      :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }"
    >
      {{ $t('keyResultPage.change') }}
      <i class="icon fa fa-pen" />
    </router-link>

    <div v-if="activeKeyResult" class="widgets">
      <widget-key-result-notes widget-id="keyResultHome.notes" />
      <widget-key-result-details widget-id="keyResultHome.details" />
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'WidgetsKeyResultHome',

  components: {
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
  },

  computed: {
    ...mapState(['activeKeyResult', 'user']),
    ...mapGetters(['hasEditRights']),
  },
};
</script>

<style lang="scss" scoped>
.link__edit-rights {
  color: var(--color-text);
  background-color: var(--color-secondary);
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  text-transform: uppercase;
}
</style>
