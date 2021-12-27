<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-mission-statement />
      <widget-team />
      <widget-child-items />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeLeft',

  components: {
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam/WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
