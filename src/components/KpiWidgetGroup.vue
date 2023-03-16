<template>
  <div class="kpi-widget-group">
    <h3 class="kpi-widget-group__title">{{ title }}</h3>
    <router-link
      v-for="kpi in kpis"
      :key="kpi.id"
      v-tooltip="kpi.description ? kpi.description : kpi.name"
      :to="{
        name: 'KpiHome',
        params: {
          slug: kpi.parent.slug,
          kpiId: kpi.id,
        },
      }"
      class="kpi-widget-group__link"
    >
      <div class="kpi-card">
        <div class="kpi-card__parent">{{ kpi.parent.name }}</div>
        <div class="kpi-card__name">{{ kpi.name }}</div>
        <div>
          <period-trend-tag :kpi="kpi" :display-graph="true" />
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'KPIs',

  components: {
    PeriodTrendTag: () => import('@/components/widgets/PeriodTrendTag.vue'),
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
  }
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  overflow: hidden;
  color: var(--color-blue-dark);
  background: var(--color-white);

  &__parent {
    margin-bottom: 0.25rem;
    font-weight: 400;
    font-size: typography.$font-size-0;
  }

  &__name {
    margin-bottom: 0.75rem;
    font-weight: 500;
    font-size: typography.$font-size-2;
  }

  &:hover {
    color: var(--color-active);
    background: var(--color-gray-light);
    ::v-deep .progressStatistics__noData {
      color: var(--color-active);
    }
  }
  &:hover &__parent {
    color: var(--color-active);
  }

  @media screen and (min-width: bp(m)) {
    &__value {
      font-size: 2rem;
    }
  }
}
</style>
