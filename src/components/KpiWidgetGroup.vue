<template>
  <div class="kpi-widget-group">
    <h3 class="kpi-widget-group__title">{{ title }}</h3>
    <router-link
      v-for="kpi in kpis"
      :key="kpi.id"
      :to="{
        name: 'ItemMeasurements',
        params: {
          ...$route.params,
          kpiId: kpi.id,
        },
      }"
      class="kpi-widget-group__link"
    >
      <widget-kpi-card :kpi="kpi" />
    </router-link>
  </div>
</template>

<script>
import { mapState } from 'vuex';
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
  },

  computed: {
    ...mapState(['activeItem']),
  },

  methods: {
    formatKPIValue,
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.kpi-widget-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  &__title {
    color: var(--color-grayscale-40);
    font-weight: 500;
    font-size: typography.$font-size-1;
  }

  &__link {
    text-decoration: none;
    border: 2px solid transparent;

    &.router-link-active {
      border-color: var(--color-hover);

      ::v-deep .widget__header {
        color: var(--color-hover);
      }
    }

    .kpi-card-widget {
      &:hover {
        background: var(--color-gray-light);

        ::v-deep .widget__header {
          color: var(--color-hover);
        }
      }
    }
  }
}
</style>
