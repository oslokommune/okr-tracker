<template>
  <main class="centered-container">
    <section>
      <h2 class="title-1">
        {{ $t('general.resultIndicator') }}
      </h2>
      <dashboard-result-indicators-section />
    </section>

    <section>
      <h2 class="title-1">
        {{ $t('general.keyFigures') }}
      </h2>
      <ul v-if="keyFigures.length" class="kpi-list">
        <li v-for="keyFigure in keyFigures" :key="keyFigure.id" class="kpi-list__card">
          <key-figure :key-figure="keyFigure" />
        </li>
      </ul>
      <empty-state
        v-else
        :icon="'exclamation'"
        :heading="$t('empty.noKPIs.heading')"
        :body="$t('empty.noKPIs.body')"
      >
        <router-link
          v-if="hasEditRights"
          :to="{ name: 'ItemAdmin', query: { tab: 'kpi' } }"
          class="btn btn--ter"
        >
          {{ $t('empty.noKPIs.linkText') }}
        </router-link>
      </empty-state>
    </section>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import KeyFigure from '@/components/KeyFigure.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'DashboardHome',
  components: {
    DashboardResultIndicatorsSection,
    KeyFigure,
    EmptyState,
  },

  computed: {
    ...mapState(['kpis', 'subKpis']),
    ...mapGetters(['hasEditRights']),

    keyFigures() {
      return [
        ...this.kpis.filter((kpi) => kpi.kpiType === 'keyfig'),
        ...this.subKpis.filter((kpi) => kpi.kpiType === 'keyfig'),
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.kpi-list {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;

  &__card {
    display: flex;
    flex: 0 0 calc(100% - 1rem);
    margin: 0.5rem;
    padding: 1rem;
    background: var(--color-white);

    @media screen and (min-width: bp(xs)) {
      flex: 0 0 calc(50% - 1rem);
    }

    @media screen and (min-width: bp(s)) {
      flex: 0 0 calc(25% - 1rem);
    }

    @media screen and (min-width: bp(m)) {
      flex: 0 0 calc(20% - 1rem);
    }
  }
}
</style>
