<template>
  <aside v-if="activeObjective" class="aside">
    <div class="widgets">
      <widget-admin />
      <widget-progression
        type="objective"
        :data="progressionData"
        :dimmed="true"
      />
      <widget-weights
        type="keyResults"
        :active-item="activeObjective"
        :items="keyResults"
      />
      <widget-objective-details />
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'WidgetsObjectiveHome',

  components: {
    WidgetAdmin: () => import('./WidgetAdmin.vue'),
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetWeights: () => import('@/components/widgets/WidgetWeights.vue'),
    WidgetObjectiveDetails: () => import('./WidgetObjectiveDetails.vue'),
  },

  computed: {
    ...mapState(['activeObjective', 'keyResults']),
    ...mapGetters(['hasEditRights']),

    // Overwrite the period's progression with the objective's
    progressionData() {
      return { ...this.activeObjective.period, progression: this.activeObjective.progression };
    },
  },
};
</script>
