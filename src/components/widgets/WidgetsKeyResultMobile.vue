<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-admin />
      <widget-mission-statement />
      <widget-team />
      <widget-key-result-notes />
      <widget-key-result-details />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam/WidgetTeam.vue';
import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import WidgetAdmin from '@/components/widgets/WidgetAdmin.vue';

export default {
  name: 'WidgetsKeyResultMobile',

  components: {
    WidgetAdmin,
    WidgetMissionStatement,
    WidgetTeam,
    WidgetKeyResultDetails,
    WidgetKeyResultNotes,
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>

<style scoped></style>
