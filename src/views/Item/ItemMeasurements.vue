<template>
  <div class="container">
    <main class="main">
      <section class="result-indicators">
        <header>
          <h2 class="title-1">
            {{ $t('general.resultIndicator') }}
          </h2>
          <dashboard-period-selector />
        </header>
        <dashboard-result-indicators-section />
      </section>

      <section>
        <h2 class="title-1">
          {{ $t('general.keyFigures') }}
        </h2>
        <kpi-grid v-if="keyFigures.length" :kpis="keyFigures" />
        <empty-state
          v-else
          :icon="'exclamation'"
          :heading="$t('empty.noKeyFigures.heading')"
          :body="$t('empty.noKeyFigures.body')"
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

      <section v-if="otherKpis.length">
        <h2 class="title-1">
          {{ $t('general.otherMeasurements') }}
        </h2>
        <kpi-grid v-if="otherKpis.length" :kpis="otherKpis" />
      </section>
    </main>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import DashboardPeriodSelector from '@/components/DashboardPeriodSelector.vue';
import KpiGrid from '@/components/KpiGrid.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'DashboardHome',
  components: {
    DashboardResultIndicatorsSection,
    DashboardPeriodSelector,
    EmptyState,
    KpiGrid,
  },

  computed: {
    ...mapState(['kpis', 'subKpis', 'selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    keyFigures() {
      return [
        ...this.kpis.filter((kpi) => kpi.kpiType === 'keyfig'),
        ...this.subKpis.filter((kpi) => kpi.kpiType === 'keyfig'),
      ];
    },

    otherKpis() {
      return this.kpis.filter((kpi) => kpi.kpiType === 'plain');
    },
  },

  watch: {
    selectedPeriod(period) {
      if (this.$route.query?.resultIndicatorPeriod !== period.key) {
        this.$router.replace({ query: { resultIndicatorPeriod: period.key } });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  > section {
    margin-bottom: 5rem;
  }
}

.result-indicators {
  header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}
</style>
