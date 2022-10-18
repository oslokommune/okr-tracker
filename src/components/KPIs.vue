<template>
  <section class="kpis">
    <h2 class="title-2">{{ $t('kpi.heading') }}</h2>
    <div class="kpis__list">
      <kpi-link v-for="kpi in kpis" :key="kpi.id" :kpi="kpi" />
    </div>
  </section>
</template>

<script>
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
};
</script>

<style lang="scss" scoped>
.kpis {
  padding-bottom: 1.5rem;
}

.kpis__list {
  display: grid;
  grid-gap: 0.25rem;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  grid-auto-rows: 1fr;
  margin-top: 1.5rem;

  ::v-deep .kpi-card {
    height: 100%;
  }
}
</style>
