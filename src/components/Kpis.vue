<template>
  <section class="kpis">
    <h2 class="title-2">{{ $t('kpi.heading') }}</h2>

    <div class="kpis__list">
      <router-link
        v-for="kpi in kpis"
        :key="kpi.id"
        v-tooltip="$t(`kpi.types.${kpi.type}`)"
        :to="{ name: 'KpiHome', params: { kpiId: kpi.id } }"
        class="kpi"
        :class="{ disabled: kpi.error }"
      >
        <div class="kpi__name">{{ kpi.name }}</div>
        <div class="kpi__value">
          <span v-if="kpi.error || !kpi.valid">–––</span>
          <span v-else>{{ getValue(kpi) }}</span>
        </div>
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
      if (type === 'satisfaction') return 'fa-smile';
      if (type === 'conversion') return 'fa-check-square';
      return '';
    },

    getValue({ type, currentValue }) {
      const numFormat = (() => {
        if (type === 'users') return format('.2s');
        if (type === 'satisfaction') return format('.2p');
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

  @media screen and (min-width: bp(m)) {
    grid-template-columns: repeat(3, minmax(15rem, 1fr));
  }
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

  &.disabled {
    opacity: 0.6;
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
