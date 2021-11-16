<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-progression widget-id="itemHome.progression" type="period" />
      <widget-weights
        widget-id="widget-objective-weights"
        :active-item="$route.name === 'ItemHome' ? activePeriod : activeObjective"
        :items="$route.name === 'ItemHome' ? objectives : keyResults"
        :type="$route.name === 'ItemHome' ? 'objective' : 'keyResult'"
      />
      <widget-admin />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeRight',

  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetAdmin: () => import('./WidgetAdmin.vue'),
    WidgetWeights: () => import('@/components/widgets/WidgetWeights.vue'),
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'activeObjective', 'objectives', 'keyResults']),
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
