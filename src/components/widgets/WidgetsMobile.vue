<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-progression
        widget-id="itemHome.progression"
        :type="$route.name === 'ItemHome' ? 'period' : 'objective'"
        :dimmed="$route.name !=='ItemHome'"
      />
      <widget-mission-statement widget-id="itemHome.missionsStatement" />
      <widget-team widget-id="itemHome.team" />
      <widget-child-items widget-id="itemHome.children" />
      <widget-weights
        widget-id="widget-objective-weights"
        :active-item="$route.name === 'ItemHome' ? activePeriod : activeObjective"
        :items="$route.name === 'ItemHome' ? objectives : keyResults"
        :type="$route.name === 'ItemHome' ? 'objective' : 'keyResult'"
      />
      <widget-admin v-if="$route.name === 'ItemHome'" />
      <widget-objective-details v-if="$route.name === 'ObjectiveHome'" widget-id="details" />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import WidgetProgression from '@/components/widgets/WidgetProgression.vue';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam.vue';
import WidgetChildItems from '@/components/widgets/WidgetChildItems.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import WidgetAdmin from '@/components/widgets/WidgetAdmin.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';

export default {
  name: 'WidgetsMobile',

  components: {
    WidgetMissionStatement,
    WidgetProgression,
    WidgetTeam,
    WidgetChildItems,
    WidgetWeights,
    WidgetAdmin,
    WidgetObjectiveDetails,
  },

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'objectives', 'keyResults', 'activeObjective']),
  },
};
</script>

<style scoped></style>
