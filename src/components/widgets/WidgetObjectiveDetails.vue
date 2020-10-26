<template>
  <Widget :widget-id="widgetId" v-if="activeObjective" :title="$t('general.details')" icon="info-circle">
    <div class="details">
      <h3 class="title-3">{{ $t('objective.period') }}</h3>

      <div class="details__period" v-if="activeObjective.period && activeObjective.period.startDate">
        <span>
          <i class="fa fa-calendar-alt"></i>
          {{ activeObjective.period.name }}
        </span>
        <span>
          {{ formatDate(activeObjective.period.startDate) }} - {{ formatDate(activeObjective.period.endDate) }}
        </span>
      </div>

      <h3 class="title-3">{{ $t('objective.progression') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-chart-line"></i>
        {{ activeObjective.progression }}
      </span>

      <h3 class="title-3">{{ $t('objective.weight') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-balance-scale"></i>
        {{ activeObjective.weight }}
      </span>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export default {
  name: 'WidgetObjectiveDetails',

  data: () => ({
    progress: [],
  }),

  computed: {
    ...mapState(['activeObjective']),
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
