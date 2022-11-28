<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-admin-edit />
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
import WidgetAdminEdit from '@/components/widgets/WidgetAdminEdit.vue';

export default {
  name: 'WidgetsKeyResultMobile',

  components: {
    WidgetAdminEdit,
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
