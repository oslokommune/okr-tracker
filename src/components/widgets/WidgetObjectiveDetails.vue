<template>
  <widget v-if="activeObjective" :widget-id="widgetId" :title="$t('general.details')">
    <div class="details">
      <div v-if="activeObjective.period && activeObjective.period.startDate" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ activeObjective.period.name }} ({{ formatPeriodDates(activeObjective.period) }})
          </div>
        </div>
      </div>

      <div v-if="activeObjective.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeObjective.created) }}</div>
        </div>
      </div>

      <div v-if="activeObjective.createdBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value">
            <router-link
              v-if="activeObjective.createdBy.id"
              :to="{ name: 'User', params: { id: activeObjective.createdBy.id } }"
            >
              {{ activeObjective.createdBy.displayName || activeObjective.createdBy.id }}
            </router-link>
            <span v-else>{{ activeObjective.createdBy }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeObjective.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeObjective.edited) }}</div>
        </div>
      </div>

      <div v-if="activeObjective.editedBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value">
            <router-link
              v-if="activeObjective.editedBy.id"
              :to="{ name: 'User', params: { id: activeObjective.editedBy.id } }"
            >
              {{ activeObjective.editedBy.displayName || activeObjective.editedBy.id }}
            </router-link>
            <span v-else>{{ activeObjective.editedBy }}</span>
          </div>
        </div>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { periodDates, dateShort, dateLong } from '@/util';

export default {
  name: 'WidgetObjectiveDetails',

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
    ...mapState(['activeObjective']),
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
