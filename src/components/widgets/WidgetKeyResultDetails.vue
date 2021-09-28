<template>
  <widget v-if="activeKeyResult" :widget-id="widgetId" :title="$t('general.details')">
    <div class="details">
      <div v-if="activeKeyResult.objective" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.belongsTo') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa" :class="`fa-${activeKeyResult.objective.icon}`"></div>
          <div class="details__item-value">
            <router-link :to="{ name: 'ObjectiveHome', params: { objectiveId: activeKeyResult.objective.id } }">
              {{ activeKeyResult.objective.name }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="activePeriod && activePeriod.startDate" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar-alt"></div>
          <div class="details__item-value">{{ activePeriod.name }} ({{ formatPeriodDates(activePeriod) }})</div>
        </div>
      </div>

      <div v-if="activeKeyResult.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeKeyResult.created) }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.createdBy" class="details__item">
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

      <div v-if="activeKeyResult.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeKeyResult.edited) }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.editedBy" class="details__item">
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

      <div v-if="activeKeyResult.startValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.startValue') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-hashtag"></div>
          <div class="details__item-value">{{ activeKeyResult.startValue }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.targetValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.targetValue') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-hashtag"></div>
          <div class="details__item-value">{{ activeKeyResult.targetValue }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.unit" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyres.unit') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-ruler"></div>
          <div class="details__item-value">{{ activeKeyResult.unit }}</div>
        </div>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { periodDates, dateShort, dateLong } from '@/util/formatDate';

export default {
  name: 'WidgetKeyResultDetails',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    progress: [],
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod']),
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
