<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-wrapper
        v-if="progression"
        :title="
          $t(`widget.progression.${$route.name === 'ItemHome' ? 'period' : 'objective'}`)
        "
      >
        <progression-chart :progression="progression" />
      </widget-wrapper>
      <widget-weights
        :active-item="$route.name === 'ItemHome' ? activePeriod : activeObjective"
        :items="$route.name === 'ItemHome' ? objectives : keyResults"
        :type="$route.name === 'ItemHome' ? 'objective' : 'keyResult'"
      />
      <widget-objective-details v-if="$route.name === 'ObjectiveHome'" />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';

export default {
  name: 'WidgetsMobile',

  components: {
    ProgressionChart: () => import('@/components/ProgressionChart.vue'),
    WidgetWrapper: () => import('./WidgetWrapper.vue'),
    WidgetWeights,
    WidgetObjectiveDetails,
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
