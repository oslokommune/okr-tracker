<template>
  <div class="kpi-grid">
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
      class="kpi-link"
      :class="{ 'kpi-link--isDisabled': kpi.error }"
    >
      <div class="kpi-card">
        <div class="kpi-card__parent">{{ kpi.parent.name }}</div>
        <div class="kpi-card__name">{{ kpi.name }}</div>
        <div>
          <span v-if="kpi.error || !kpi.valid">–––</span>
          <period-trend-tag :kpi="kpi" />
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

.kpi-grid {
  display: grid;
  grid-auto-rows: 1fr;
  grid-gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
}

.kpi-link {
  text-decoration: none;

  &--isDisabled {
    opacity: 0.25;
  }
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
