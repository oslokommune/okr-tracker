<template>
  <aside v-if="activeObjective" class="aside">
    <div v-if="editRights" class="keyresult">
      <router-link
        class="btn btn--ter btn--icon"
        :to="{ name: 'ItemAdminOKRs', query: { type: 'objective', id: activeObjective.id } }"
      >
        <i class="icon fa fa-edit"></i>
        {{ $t('objective.change') }}
      </router-link>
    </div>

    <div class="widgets">
      <widget-progression
        widget-id="objectiveHome.progression"
        type="objective"
        :data="progressionData"
        :dimmed="true"
      ></widget-progression>
      <widget-objective-details widget-id="objectiveHome.details"></widget-objective-details>
      <widget-objective-weights widget-id="objectiveHome.weights"></widget-objective-weights>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsObjectiveHome',

  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetObjectiveDetails: () => import('./WidgetObjectiveDetails.vue'),
    WidgetObjectiveWeights: () => import('./WidgetObjectiveWeights.vue'),
  },

  computed: {
    ...mapState(['activeObjective', 'user', 'activePeriod']),
    editRights() {
      if (this.user.admin) return true;
      const { team } = this.activeObjective.parent;
      if (!team) return false;
      return team.includes(this.user.ref.path);
    },

    // Overwrite the period's progression with the objective's
    progressionData() {
      return { ...this.activeObjective.period, progression: this.activeObjective.progression };
    },
  },
};
</script>

<style lang="scss" scoped>
.keyresult {
  display: flex;
  width: 100%;
  margin: 1.75rem 0 1rem;

  & > .btn {
    width: 100%;
  }
}
</style>
