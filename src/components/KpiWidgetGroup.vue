<template>
  <div :class="['kpi-widget-group', { 'kpi-widget-group--compact': compact }]">
    <div class="kpi-widget-group__title">
      <h2>{{ title }}</h2>
      <template v-if="!compact">
        <span v-if="selectedPeriod.startDate && selectedPeriod.endDate">
          {{ periodDates(selectedPeriod) }}
        </span>
        <span v-else>
          {{ selectedPeriod.label }}
        </span>
      </template>
    </div>
    <div class="kpi-widget-group__kpis">
      <router-link
        v-for="kpi in kpis"
        :key="kpi.id"
        :to="{
          name: 'ItemMeasurements',
          params: { ...$route.params, kpiId: kpi.id },
          query: { resultIndicatorPeriod: selectedPeriod?.key },
        }"
        class="kpi-widget-group__link"
      >
        <widget-kpi-card :kpi="kpi" :compact="compact" />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { periodDates } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import WidgetKpiCard from '@/components/widgets/WidgetKpiCard/WidgetKpiCard.vue';

export default {
  name: 'KpiWidgetGroup',

  components: {
    WidgetKpiCard,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    kpis: {
      type: Array,
      required: true,
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapState(['selectedPeriod']),
  },

  methods: {
    periodDates,
    formatKPIValue,
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.kpi-widget-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 4rem;

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-grayscale-40);

    h2 {
      font-weight: 500;
      font-size: typography.$font-size-3;
    }

    span {
      font-size: typography.$font-size-1;
    }
  }

  &__kpis {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__link {
    text-decoration: none;
    border: 2px solid transparent;

    &.router-link-active {
      border-color: var(--color-hover);

      ::v-deep .widget__header h3 {
        color: var(--color-hover);
      }
    }

    .kpi-card-widget {
      &:hover {
        background: var(--color-gray-light);

        ::v-deep {
          .widget__header h3 {
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

  &--compact {
    gap: 0.5rem;
    margin-bottom: 1rem;

    .kpi-widget-group__title h2 {
      font-size: typography.$font-size-1;
    }

    .kpi-widget-group__kpis {
      gap: 0.5rem;
    }
  }
}
</style>
