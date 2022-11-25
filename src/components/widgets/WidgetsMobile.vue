<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-dashboard-entry v-if="isDepartment(activeItem)" :slug="activeItem.slug" />
      <widget-admin-edit />
      <widget-wrapper
        v-if="progression"
        :title="
          $t(
            `widget.progression.${
              $route.name === 'ItemHome' ? 'period' : 'objective'
            }`
          )
        "
      >
        <progression-chart :progression="progression" />
      </widget-wrapper>
      <widget-mission-statement />
      <widget-team />
      <widget-child-items />
      <widget-weights
        :active-item="
          $route.name === 'ItemHome' ? activePeriod : activeObjective
        "
        :items="$route.name === 'ItemHome' ? objectives : keyResults"
        :type="$route.name === 'ItemHome' ? 'objective' : 'keyResult'"
      />
      <widget-objective-details v-if="$route.name === 'ObjectiveHome'" />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import { isDepartment } from '@/util/getActiveItemType';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam/WidgetTeam.vue';
import WidgetChildItems from '@/components/widgets/WidgetChildItems.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import WidgetAdminEdit from '@/components/widgets/WidgetAdminEdit.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';

export default {
  name: 'WidgetsMobile',

  data: () => ({
    isDepartment
  }),

  components: {
    WidgetMissionStatement,
    ProgressionChart: () => import('@/components/ProgressionChart.vue'),
    WidgetWrapper: () => import('./WidgetWrapper.vue'),
    WidgetTeam,
    WidgetChildItems,
    WidgetWeights,
    WidgetAdminEdit,
    WidgetObjectiveDetails,
    WidgetDashboardEntry: () =>
      import('@/components/widgets/WidgetDashboardEntry.vue'),
  },

  computed: {
    ...mapState([
      'activeItem',
      'activePeriod',
      'objectives',
      'keyResults',
      'activeObjective',
    ]),

    progression() {
      if (this.$route.name === 'ItemHome') {
        return this.activePeriod?.progression;
      }

      return this.activeObjective?.progression;
    },
  },
};
</script>
