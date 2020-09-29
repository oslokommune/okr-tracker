<template>
  <Widget v-if="activeKeyResult.notes" title="Notater" icon="pencil-alt">
    {{ activeKeyResult.notes }}
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetKeyResultNotes',

  computed: {
    ...mapState(['activeKeyResult']),
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>

<style scoped></style>
