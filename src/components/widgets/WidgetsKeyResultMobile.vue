<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-mission-statement widget-id="KeyResultHome.MissionStatement" />
      <widget-team widget-id="KeyResultHome.team" />
      <widget-key-result-notes widget-id="KeyResultHome.notes" />
      <widget-key-result-details widget-id="KeyResultHome.details" />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam.vue';
import WidgetKeyResultNotes from "@/components/widgets/WidgetKeyResultNotes.vue";
import WidgetKeyResultDetails from "@/components/widgets/WidgetKeyResultDetails.vue";

export default {
  name: 'WidgetsKeyResultMobile',

  components: {
    WidgetMissionStatement,
    WidgetTeam,
    WidgetKeyResultDetails,
    WidgetKeyResultNotes,
  },

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'objectives', 'keyResults', 'activeObjective']),
  },
};
</script>

<style scoped></style>
