<template>
  <Widget :widget-id="widgetId" v-if="activeObjective" :title="$t('general.details')" icon="info-circle">
    <div class="details">
      <div class="details__item" v-if="activeObjective.period && activeObjective.period.startDate">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar-alt"></div>
          <div class="details__item-value">
            {{ activeObjective.period.name }} ({{ formatPeriodDates(activeObjective.period) }})
          </div>
        </div>
      </div>

      <div class="details__item" v-if="activeObjective.created">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeObjective.created) }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeObjective.createdBy">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-icon fa fa-user"></div>
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

      <div class="details__item" v-if="activeObjective.edited">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-calendar"></div>
          <div class="details__item-value">{{ formatDate(activeObjective.edited) }}</div>
        </div>
      </div>

      <div class="details__item" v-if="activeObjective.editedBy">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-icon fa fa-user"></div>
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

      <div class="details__item">
        <h3 class="title-3 details__item-heading">Heading</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-user"></div>
          <div class="details__item-value">User</div>
        </div>
      </div>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { periodDates, dateShort, dateLong } from '@/util/formatDate';

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
    formatPeriodDates(period) {
      return periodDates(period, dateShort);
    },
    formatDate(date) {
      return dateLong(date.toDate());
    },
  },
};
</script>
