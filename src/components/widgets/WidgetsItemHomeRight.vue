<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-dashbord-entry :slug="activeItem.slug" />
      <widget-admin />
      <widget-wrapper
        :title="
          $t(
            `widget.progression.${
              $route.name === 'ItemHome' ? 'period' : 'objective'
            }`
          )
        "
      >
        <progression-chart
          :progression="
            $route.name === 'ItemHome'
              ? activePeriod.progression
              : activeObjective.progression
          "
        />
      </widget-wrapper>
      <widget-weights
        :active-item="
          $route.name === 'ItemHome' ? activePeriod : activeObjective
        "
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
    WidgetAdmin: () => import('./WidgetAdmin.vue'),
    WidgetWeights: () => import('@/components/widgets/WidgetWeights.vue'),
    WidgetDashbordEntry: () =>
      import('@/components/widgets/WidgetDashbordEntry.vue'),
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'activePeriod',
      'activeObjective',
      'objectives',
      'keyResults',
    ]),
  },

  watch: {
    activePeriod: {
      immediate: true,
      handler() {
        this.disabled = !this.activePeriod;
      },
    },
  },
};
</script>
