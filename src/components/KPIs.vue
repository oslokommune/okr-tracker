<template>
  <section class="kpis">
    <h2 class="title-2">{{ $t('kpi.heading') }}</h2>
    <div class="kpis__list">
      <kpi-link
        v-for="(kpi, type) in kpiTypes"
        :key="type"
        :type="type"
        :kpi="kpi"
        :data="kpis.find((k) => k.type === type)"
      />
    </div>
  </section>
</template>

<script>
import kpiTypes from '@/config/kpiTypes';
import KpiLink from './KpiLink.vue';

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
    kpiTypes,
  }),
};
</script>

<style lang="scss" scoped>
.kpis {
  margin-bottom: 0.5rem;
  padding: 1rem;
  background: var(--color-white);
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
