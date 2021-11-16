<template>
  <aside v-if="activeObjective" class="aside">
    <router-link
      v-if="hasEditRights"
      class="btn btn--icon btn--icon-pri aside__link--edit-rights"
      :to="{ name: 'ItemAdminOKRs', query: { type: 'objective', id: activeObjective.id } }"
    >
      {{ $t('objective.change') }}
      <i class="icon fa fa-pen" />
    </router-link>

    <div class="widgets">
      <widget-progression
        widget-id="objectiveHome.progression"
        type="objective"
        :data="progressionData"
        :dimmed="true"
      />
      <widget-weights
        widget-id="widget-key-result-weights"
        type="keyResults"
        :active-item="activeObjective"
        :items="keyResults"
      />
      <widget-objective-details widget-id="objectiveHome.details" />
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'WidgetsObjectiveHome',

  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetWeights: () => import('@/components/widgets/WidgetWeights.vue'),
    WidgetObjectiveDetails: () => import('./WidgetObjectiveDetails.vue'),
  },

  computed: {
    ...mapState(['activeObjective', 'user', 'activePeriod', 'objectives', 'keyResults']),
    ...mapGetters(['hasEditRights']),

    // Overwrite the period's progression with the objective's
    progressionData() {
      return { ...this.activeObjective.period, progression: this.activeObjective.progression };
    },
  },
};
</script>
