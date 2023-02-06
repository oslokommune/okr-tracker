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
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeRight',

  components: {
    WidgetWrapper: () => import('./WidgetWrapper.vue'),
    ProgressionChart: () => import('@/components/ProgressionChart.vue'),
    WidgetWeights: () => import('@/components/widgets/WidgetWeights.vue'),
  },

  computed: {
    ...mapState([
      'activeItem',
      'activePeriod',
      'activeObjective',
      'objectives',
      'keyResults',
    ]),

    progression() {
      return this.$route.name === 'ItemHome'
        ? this.activePeriod?.progression
        : this.activeObjective?.progression;
    },
  },
};
</script>
