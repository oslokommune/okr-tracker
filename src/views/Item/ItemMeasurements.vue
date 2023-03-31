<template>
  <div class="container--alt">
    <template v-if="allKpis.length">
      <aside class="aside--alt widgets">
        <template v-for="(group, index) in kpiGroups">
          <kpi-widget-group
            v-if="group.kpis.length > 0"
            :key="`kpi-group-${index}`"
            v-bind="group"
          />
        </template>
      </aside>

      <kpi-details v-if="activeKpi" :kpi="activeKpi" />
    </template>

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
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';
import EmptyState from '@/components/EmptyState.vue';
import KpiDetails from '@/components/KpiDetails.vue';

export default {
  name: 'ItemMeasurements',

  components: {
    KpiWidgetGroup,
    KpiDetails,
    EmptyState,
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

    allKpis() {
      return this.resultIndicators.concat(this.keyFigures, this.otherKpis);
    },
  },

  watch: {
    '$route.params': {
      immediate: true,
      async handler(params) {
        const { kpiId } = params;
        if (!kpiId && this.allKpis.length) {
          this.$router.replace({
            params: {
              ...params,
              kpiId: this.allKpis[0].id,
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
