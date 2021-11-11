<template>
  <aside v-if="activeObjective" class="aside">
    <router-link
      v-if="hasEditRights"
      class="btn btn--ter btn--icon btn--icon-pri link__edit-rights"
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
      <widget-key-result-weights widget-id="widget-key-result-weights" />
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
    WidgetKeyResultWeights: () => import('@/components/widgets/WidgetKeyResultWeights.vue'),
    WidgetObjectiveDetails: () => import('./WidgetObjectiveDetails.vue'),
  },

  computed: {
    ...mapState(['activeObjective', 'user', 'activePeriod']),
    ...mapGetters(['hasEditRights']),

    // Overwrite the period's progression with the objective's
    progressionData() {
      return { ...this.activeObjective.period, progression: this.activeObjective.progression };
    },
  },
};
</script>

<style lang="scss" scoped>
.widgets__links {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1.5rem 0;
  background-color: var(--color-primary);

  & > .btn {
    width: 100%;
  }
}

.link__edit-rights {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  color: var(--color-text);
  text-transform: uppercase;
  background-color: var(--color-secondary);
}
</style>
