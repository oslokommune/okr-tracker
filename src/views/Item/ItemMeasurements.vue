<template>
  <div class="container--alt">
    <aside class="aside--alt widgets">
      <kpi-widget-group
        v-for="(group, index) in kpiGroups"
        :key="`kpi-group-${index}`"
        v-bind="group"
      />
    </aside>

    <kpi-details v-if="activeKpi" :kpi="activeKpi" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';
import KpiDetails from '@/components/KpiDetails.vue';

export default {
  name: 'ItemMeasurements',

  components: {
    KpiWidgetGroup,
    KpiDetails,
  },

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_kpi', null);
      next();
    } catch (error) {
      next(false);
    }
  },

  computed: {
    ...mapState(['kpis', 'subKpis', 'activeKpi', 'selectedPeriod']),

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
    '$route.params': {
      immediate: true,
      async handler(params) {
        const { kpiId } = params;
        if (!kpiId) {
          const availableKpis = this.resultIndicators.concat(
            this.keyFigures,
            this.otherKpis
          );
          this.$router.replace({
            params: {
              ...params,
              kpiId: availableKpis[0].id,
            },
          });
        } else if (kpiId !== this.activeKpi?.id) {
          await this.$store.dispatch('set_active_kpi', kpiId);
        }
      },
    },

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
