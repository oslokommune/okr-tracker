<template>
  <aside v-if="activeObjective" class="wrapper">
    <div class="keyresult" v-if="editRights">
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
  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetObjectiveDetails: () => import('./WidgetObjectiveDetails.vue'),
    // WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
    WidgetObjectiveWeights: () => import('./WidgetObjectiveWeights.vue'),
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }
}
.keyresult {
  display: flex;
  width: 100%;
  margin: 1.75rem 0 1rem;

  & > .btn {
    width: 100%;
  }
}
</style>
