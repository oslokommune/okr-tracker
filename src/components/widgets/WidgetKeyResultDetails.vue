<template>
  <Widget v-if="activeKeyResult" title="Detaljer" icon="info-circle">
    <div class="details">
      <h3 class="title-3">Tilhører mål</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-trophy"></i>
        {{ activeKeyResult.objective.name }}
      </span>
      <h3 class="title-3">Periode</h3>

      <div class="details__period">
        <span>
          <i class="fa fa-calendar-alt"></i>
          {{ activePeriod.name }}
        </span>
        <span> {{ formatDate(activePeriod.startDate) }} - {{ formatDate(activePeriod.endDate) }} </span>
      </div>

      <h3 class="title-3">Antall oppdateringer</h3>

      <span class="details--margin-bottom">
        <i class="fa fa-chart-line"></i>
        {{ progress.length }}
      </span>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

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

  methods: {
    formatDate(date) {
      return format(date.toDate(), 'd MMMM Y', { locale: nb });
    },
  },
};
</script>

<style lang="scss" scoped>
.details {
  display: flex;
  flex-direction: column;

  &--margin-bottom {
    margin-bottom: 1rem;
  }

  &__period {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
}
</style>
