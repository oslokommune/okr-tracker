<template>
  <section class="kpis">
    <h2 class="title-2">{{ $t('kpi.heading') }}</h2>
    <div class="kpis__list">
      <kpi-link
        v-for="(kpi, type) in kpiTypes"
        :key="type"
        :type="type"
        :kpi="kpi"
        :data="kpis.find(k => k.type === type)"
      ></kpi-link>
    </div>
  </section>
</template>

<script>
import kpiTypes from '@/config/kpiTypes';
import KpiLink from './KpiLink.vue';

export default {
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
  margin-bottom: 1.5rem;
}

.kpis__list {
  display: grid;
  grid-gap: 0.25rem;

  @media screen and (min-width: bp(m)) {
    grid-template-columns: repeat(3, minmax(15rem, 1fr));
  }
}
</style>
