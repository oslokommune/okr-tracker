<template>
  <aside v-if="activeKeyResult" class="aside">
    <div class="widgets">
      <widget-admin />
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
    WidgetAdmin: () => import('./WidgetAdmin.vue'),
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
  },

  computed: {
    ...mapState(['activeKeyResult']),
    ...mapGetters(['hasEditRights']),
  },
};
</script>
