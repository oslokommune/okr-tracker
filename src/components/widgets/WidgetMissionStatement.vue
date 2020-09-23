<template>
  <Widget v-if="activeItem.missionStatement" title="Oppdrag" icon="file">
    {{ activeItem.missionStatement }}
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem']),
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>
