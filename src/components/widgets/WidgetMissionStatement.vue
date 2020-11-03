<template>
  <Widget v-if="activeItem.missionStatement" :widget-id="widgetId" :title="$t('document.mission')" icon="file">
    {{ activeItem.missionStatement }}
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetMissionStatement',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
