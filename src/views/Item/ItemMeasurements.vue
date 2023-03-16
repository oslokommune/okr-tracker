<template>
  <div class="container--alt">
    <aside class="aside--alt widgets">
      <kpi-widget-group
        v-for="(group, index) in kpiGroups"
        :key="`kpi-group-${index}`"
        v-bind="group"
      />
    </aside>

    <main class="main--alt">
      <section class="result-indicators">
        <header>
          <h2 class="title-1">
            {{ $t('general.resultIndicator') }}
          </h2>
        </header>
        <dashboard-result-indicators-section />
      </section>
    </main>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';

export default {
  name: 'DashboardHome',
  components: {
    DashboardResultIndicatorsSection,
    KpiWidgetGroup,
  },

  computed: {
    ...mapState(['kpis', 'subKpis', 'selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    kpiGroups() {
      return [
        {
          title: this.$t('general.resultIndicator'),
          kpis: this.resultIndicators,
        },
        {
          title: this.$t('general.keyFigures'),
          kpis: this.keyFigures,
        },
        {
          title: this.$t('general.otherMeasurements'),
          kpis: this.otherKpis,
        },
      ];
    },

    resultIndicators() {
      return [
        ...this.kpis.filter((kpi) => kpi.kpiType === 'ri'),
        ...this.subKpis.filter((kpi) => kpi.kpiType === 'ri'),
      ];
    },

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
.result-indicators {
  header {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    .title-1 {
      margin-bottom: 0rem;
    }
  }
}
</style>
