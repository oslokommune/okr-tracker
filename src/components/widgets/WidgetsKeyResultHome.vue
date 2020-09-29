<template>
  <aside v-if="activeKeyResult" class="widgets">
    <widget-key-result-details v-if="activeKeyResult"></widget-key-result-details>
    <widget-key-result-notes v-if="activeKeyResult"></widget-key-result-notes>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsKeyResultHome',

  computed: {
    ...mapState(['activeKeyResult']),
  },
  components: {
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
  },
};
</script>

<style lang="scss" scoped></style>
