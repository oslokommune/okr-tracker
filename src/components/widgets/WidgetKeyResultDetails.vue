<template>
  <Widget :widget-id="widgetId" v-if="activeKeyResult" :title="$t('general.details')" icon="info-circle">
    <div class="details">
      <div class="details__item" v-if="activeKeyResult.objective">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.belongsTo') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa" :class="`fa-${activeKeyResult.objective.icon}`"></div>
          <div class="details__item-value">
            <router-link :to="{ name: 'ObjectiveHome', params: { objectiveId: activeKeyResult.objective.id } }">{{
              activeKeyResult.objective.name
            }}</router-link>
          </div>
        </div>
      </div>

      <div class="details__item" v-if="activePeriod && activePeriod.startDate">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar-alt"></div>
          <div class="details__item-value">{{ activePeriod.name }} ({{ formatPeriodDates(activePeriod) }})</div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.created">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeKeyResult.created) }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.createdBy">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-icon fa fa-user"></div>
          <div class="details__item-value">
            <router-link
              v-if="activeKeyResult.createdBy.id"
              :to="{ name: 'User', params: { id: activeKeyResult.createdBy.id } }"
            >
              {{ activeKeyResult.createdBy.displayName || activeKeyResult.createdBy.id }}
            </router-link>
            <span v-else>{{ activeKeyResult.createdBy }}</span>
          </div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.edited">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeKeyResult.edited) }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.editedBy">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-icon fa fa-user"></div>
          <div class="details__item-value">
            <router-link
              v-if="activeKeyResult.editedBy.id"
              :to="{ name: 'User', params: { id: activeKeyResult.editedBy.id } }"
            >
              {{ activeKeyResult.editedBy.displayName || activeKeyResult.editedBy.id }}
            </router-link>
            <span v-else>{{ activeKeyResult.editedBy }}</span>
          </div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.startValue !== undefined">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.startValue') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-hashtag"></div>
          <div class="details__item-value">{{ activeKeyResult.startValue }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.targetValue !== undefined">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.targetValue') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-hashtag"></div>
          <div class="details__item-value">{{ activeKeyResult.targetValue }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeKeyResult.unit">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.unit') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-ruler"></div>
          <div class="details__item-value">{{ activeKeyResult.unit }}</div>
        </div>
      </div>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { periodDates, dateShort, dateLong } from '@/util/formatDate';

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
    formatPeriodDates(period) {
      return periodDates(period, dateShort);
    },
    formatDate(date) {
      return dateLong(date.toDate());
    },
  },
};
</script>
