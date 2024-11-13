<script setup>
import { storeToRefs } from 'pinia';
import { useKpisStore } from '@/store/kpis';
import WidgetKpiCard from '@/components/widgets/WidgetKpiCard.vue';

defineProps({
  kpiId: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { period } = storeToRefs(useKpisStore());
</script>

<template>
  <RouterLink
    :key="kpiId"
    :to="{
      name: 'ItemMeasurements',
      params: { ...$route.params, kpiId },
      query: { resultIndicatorPeriod: period?.key },
    }"
    class="kpi-widget-group-link"
  >
    <WidgetKpiCard :kpi-id="kpiId" :compact="compact" />
  </RouterLink>
</template>

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

    :deep(.widget__header h3),
    :deep(.period-trend-tag__value) {
      color: var(--color-hover);
    }
  }

  .kpi-card-widget {
    &:hover {
      background: var(--color-gray-light);
      border-color: var(--color-gray);

      :deep(.widget__header h3),
      :deep(.period-trend-tag__value) {
        color: var(--color-hover);
      }

      :deep(.period-trend-tag__trend) {
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
</style>
