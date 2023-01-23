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
          {{ $t('empty.noKeyFigures.linkText') }}
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
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import KpiGrid from '@/components/KpiGrid.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'DashboardHome',
  components: {
    DashboardResultIndicatorsSection,
    EmptyState,
    KpiGrid,
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

    otherKpis() {
      return this.kpis.filter((kpi) => kpi.kpiType === 'plain');
    },
  },
};
</script>