<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-progression widget-id="itemHome.progression" type="period" />
      <widget-objective-weights widget-id="widget-objective-weights" />
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
    WidgetObjectiveWeights: () => import('@/components/widgets/WidgetObjectiveWeights.vue'),
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activeItem']),
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
