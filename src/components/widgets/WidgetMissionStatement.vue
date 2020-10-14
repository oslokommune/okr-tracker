<template>
  <Widget v-if="activeItem.missionStatement" :widget-id="widgetId" title="Oppdrag" icon="file">
    {{ activeItem.missionStatement }}
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem']),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>
