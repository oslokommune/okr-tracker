<template>
  <section class="kpis">
    <h2 class="title-2">KPI-er</h2>

    <div class="kpis__list">
      <router-link v-for="kpi in kpis" :key="kpi.id" :to="{ name: 'KpiHome', params: { kpiId: kpi.id } }" class="kpi">
        <div class="kpi__name">{{ kpi.name }}</div>
        <div class="kpi__value">{{ getValue(kpi) }}</div>
        <span class="kpi__icon far" :class="getKpiIcon(kpi)"></span>
      </router-link>
    </div>
  </section>
</template>

<script>
import { format } from 'd3';

export default {
  props: {
    kpis: {
      type: Array,
      required: true,
    },
  },

  methods: {
    getKpiIcon({ type }) {
      if (type === 'users') return 'fa-user';
      if (type === 'satisfation') return 'fa-smile';
      if (type === 'conversion') return 'fa-check-square';
      return '';
    },

    getValue({ type, currentValue }) {
      const numFormat = (() => {
        if (type === 'users') return format('.2s');
        if (type === 'satisfation') return format('.2p');
        if (type === 'conversion') return format('.2p');
      })();

      return numFormat(currentValue);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.kpis {
  margin-bottom: 1.5rem;
}

.kpis__list {
  display: grid;
  grid-gap: 0.25rem;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}

.kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 8rem;
  padding: 1rem;
  color: white;
  font-weight: 500;
  text-decoration: none;
  background: $color-purple;

  &:hover {
    background: darken($color-purple, 6%);
  }
}

.kpi__value {
  font-weight: 900;
  font-size: 3rem;
  line-height: 1em;
}

.kpi__icon {
  position: absolute;
  right: -1rem;
  bottom: -1rem;
  font-size: 8rem;
  opacity: 0.15;
}
</style>
