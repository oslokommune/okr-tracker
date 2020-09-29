<template>
  <Widget v-if="activeKeyResult" title="Detaljer" icon="info-circle">
    Tilhører mål: {{ activeKeyResult.objective.name }} Periode: {{ activePeriod.name }}
    {{ activePeriod.startDate.toDate() }} - {{ activePeriod.endDate.toDate() }} Antall oppdateringer:
    {{ progress.length }}
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';

export default {
  name: 'WidgetKeyResultDetails',

  data: () => ({
    progress: [],
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod']),
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyresult) {
        if (!keyresult) return;
        await this.$bind('progress', db.collection(`keyResults/${keyresult.id}/progress`));
      },
    },
  },
};
</script>

<style scoped></style>
