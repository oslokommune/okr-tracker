<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-progression v-if="activePeriod" widget-id="itemHome.progression" type="period" :data="activePeriod" />
      <widget-objective-weights widget-id="widget-objective-weights" />
      <widget-admin :active-item="activeItem" />
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

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
    ...mapState(['activeItem', 'activePeriod', 'user', 'dataLoading']),
    ...mapGetters(['hasEditRights']),
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
