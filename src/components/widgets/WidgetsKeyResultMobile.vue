<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-key-result-notes />
      <widget-key-result-details />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';

export default {
  name: 'WidgetsKeyResultMobile',

  components: {
    WidgetKeyResultDetails,
    WidgetKeyResultNotes,
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
