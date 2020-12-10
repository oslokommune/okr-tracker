<template>
  <aside v-if="activeKeyResult" class="aside">
    <div v-if="hasEditRights" class="widgets__links">
      <router-link
        class="btn btn--ter btn--icon"
        :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }"
      >
        <i class="icon fa fa-edit" />
        {{ $t('keyResultPage.change') }}
      </router-link>
    </div>

    <div v-if="activeKeyResult" class="widgets">
      <widget-key-result-details widget-id="keyResultHome.details" />
      <widget-key-result-notes widget-id="keyResultHome.notes" />
      <widget-key-result-weights widget-id="keyResultHome.weights" />
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
    WidgetKeyResultWeights: () => import('./WidgetKeyResultWeights.vue'),
  },

  computed: {
    ...mapState(['activeKeyResult', 'user']),
    ...mapGetters(['hasEditRights']),
  },
};
</script>
