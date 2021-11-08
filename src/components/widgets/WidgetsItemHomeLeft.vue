<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-mission-statement widget-id="itemHome.missionStatement" />
      <widget-team widget-id="itemHome.team" />
      <widget-child-items widget-id="itemHome.children" />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeLeft',

  components: {
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
