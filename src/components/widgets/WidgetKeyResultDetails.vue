<template>
  <Widget :widget-id="widgetId" v-if="activeKeyResult" :title="$t('general.details')" icon="info-circle">
    <div class="details">
      <h3 class="title-3">{{ $t('keyres.belongsTo') }}</h3>
      <span class="details--margin-bottom" v-if="activeKeyResult.objective">
        <i class="fa fa-trophy"></i>
        {{ activeKeyResult.objective.name }}
      </span>

      <h3 class="title-3">{{ $t('general.createdBy') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-user"></i>
        {{ activeKeyResult.createdBy.displayName || activeKeyResult.createdBy.id }}
      </span>

      <h3 class="title-3">{{ $t('period.period') }}</h3>
      <div class="details__period" v-if="activePeriod">
        <span>
          <i class="fa fa-calendar-alt"></i>
          {{ activePeriod.name }}
        </span>
        <span> {{ formatDate(activePeriod.startDate) }} - {{ formatDate(activePeriod.endDate) }} </span>
      </div>

      <h3 class="title-3">{{ $t('keyres.numberOfUpdates') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-chart-line"></i>
        {{ progress.length }}
      </span>

      <h3 class="title-3" v-if="activeKeyResult.editedBy">Edited by</h3>
      <span v-if="activeKeyResult.editedBy" class="details--margin-bottom">
        <i class="fa fa-user"></i>
        {{ activeKeyResult.editedBy.displayName || activeKeyResult.editedBy.id }}
      </span>

      <h3 class="title-3">{{ $t('keyres.targetValue') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-bullseye" />
        {{ activeKeyResult.unit }}: {{ activeKeyResult.targetValue }}
      </span>

      <h3 class="title-3">{{ $t('general.lastUpdate') }}</h3>
      <span class="details--margin-bottom">
        <i class="fa fa-user-edit" />
        {{ formatDate(activePeriod.edited) }}
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

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

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
