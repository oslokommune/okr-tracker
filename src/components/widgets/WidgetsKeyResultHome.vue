<template>
  <aside v-if="activeKeyResult" class="aside">
    <router-link
      v-if="hasEditRights"
      class="btn btn--icon btn--icon-pri aside__link--edit-rights"
      :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }"
    >
      {{ $t('keyResultPage.change') }}
      <i class="icon fa fa-pen" />
    </router-link>

    <div v-if="activeKeyResult" class="widgets">
      <widget-key-result-notes />
      <widget-key-result-details />
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
    ...mapState(['activeKeyResult']),
    ...mapGetters(['hasEditRights']),
  },
};
</script>
