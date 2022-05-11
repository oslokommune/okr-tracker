<template>
  <section class="kpis">
    <h2 class="title-2">{{ $t('kpi.heading') }}</h2>
    <div class="kpis__list">
      <kpi-link
        v-for="kpiType in KPI_TYPES"
        :key="kpiType"
        :kpi-type="kpiType"
        :kpi="kpis.find((kpi) => kpi.type === kpiType)"
      />
    </div>
  </section>
</template>

<script>
import KpiLink from './KpiLink.vue';
import { KPI_TYPES } from '@/util/kpiHelpers';

export default {
  name: 'KPIs',

  components: {
    KpiLink,
  },

  props: {
    kpis: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    KPI_TYPES,
  }),
};
</script>

<style lang="scss" scoped>
.kpis {
  padding-bottom: 1.5rem;
}

.kpis__list {
  display: grid;
  grid-gap: 0.25rem;
  margin-top: 1.5rem;

  @media screen and (min-width: bp(m)) {
    grid-template-columns: repeat(3, minmax(10rem, 1fr));
  }
}
</style>
