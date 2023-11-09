<template>
  <router-link
    :key="kpi.id"
    :to="{
      name: 'ItemMeasurements',
      params: { ...$route.params, kpiId: kpi.id },
      query: { resultIndicatorPeriod: selectedPeriod?.key },
    }"
    class="kpi-widget-group-link"
  >
    <widget-kpi-card :kpi="kpi" :compact="compact" />
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import WidgetKpiCard from '@/components/widgets/WidgetKpiCard/WidgetKpiCard.vue';

export default {
  name: 'KpiWidgetGroupLink',

  components: {
    WidgetKpiCard,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapState('kpis', ['selectedPeriod']),
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.kpi-widget-group-link {
  text-decoration: none;
  border: 2px solid transparent;

  &.router-link-active {
    border-color: var(--color-hover);

    .kpi-card-widget {
      border-color: var(--color-white);
    }

    ::v-deep .widget__header h3,
    ::v-deep .period-trend-tag__value {
      color: var(--color-hover);
    }
  }

  .kpi-card-widget {
    &:hover {
      background: var(--color-gray-light);
      border-color: var(--color-gray);

      ::v-deep {
        .widget__header h3,
        .period-trend-tag__value {
          color: var(--color-hover);
        }

        .period-trend-tag__trend {
          &:before {
            border-left-color: var(--color-gray-light);
          }
          &:after {
            border-top-color: var(--color-gray-light);
            border-bottom-color: var(--color-gray-light);
          }
        }
      }
    }
  }
}
</style>
