<template>
  <page-layout
    v-if="allKpis.length"
    :breakpoint="showKpiDetails ? 'desktop' : 'tablet-big'"
    sidebar-position="left"
    :sidebar-cols="showKpiDetails ? 3 : 12"
    :sidebar-grid="showKpiDetails"
  >
    <template #sidebar>
      <template v-for="(group, index) in kpiGroups">
        <kpi-widget-group
          v-if="group.kpis.length > 0"
          :key="`kpi-group-${index}`"
          v-bind="group"
          :compact="showKpiDetails"
        />
      </template>
    </template>

    <template v-if="showKpiDetails" #default>
      <kpi-details v-if="kpi" :kpi="kpi" />
      <not-found-page
        v-else
        :heading="$t('notFound.measurementHeading')"
        :body="$t('notFound.measurementBody')"
      />
    </template>
  </page-layout>

  <empty-page
    v-else
    :heading="$t('empty.noKPIs.heading')"
    :body="$t('empty.noKPIs.body')"
  >
    <div v-if="hasEditRights" data-mode="dark">
      <pkt-button
        :text="$t('empty.noKPIs.buttonText')"
        skin="primary"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="$router.push({ name: 'ItemAdmin', query: { tab: 'kpi' } })"
      />
    </div>
  </empty-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';
import KpiDetails from '@/components/KpiDetails.vue';

export default {
  name: 'ItemMeasurements',

  components: {
    KpiWidgetGroup,
    KpiDetails,
    EmptyPage: () => import('@/components/pages/EmptyPage.vue'),
    PktButton: () => import('@oslokommune/punkt-vue2').then(({ PktButton }) => PktButton),
    NotFoundPage: () => import('@/components/pages/NotFoundPage.vue'),
  },

  data: () => ({
    kpi: null,
    showKpiDetails: true,
  }),

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

    allKpis() {
      return this.resultIndicators.concat(this.keyFigures, this.otherKpis);
    },
  },

  watch: {
    $route: {
      immediate: true,
      async handler({ params, query }) {
        this.$nextTick(() => {
          this.$el.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
        });

        if (query.view === 'list') {
          this.showKpiDetails = false;
          return;
        }

        const { kpiId } = params;

        if (!kpiId && this.allKpis.length) {
          this.$router.replace({
            params: { ...params, kpiId: this.allKpis[0].id },
            query: { resultIndicatorPeriod: this.selectedPeriod?.key },
          });
        } else {
          this.kpi = this.allKpis.find((k) => k.id === kpiId) || null;
        }

        this.showKpiDetails = true;
      },
    },

    selectedPeriod(period) {
      const { view, resultIndicatorPeriod } = this.$route.query;
      const targetView = view === 'list' ? 'list' : undefined;
      if (resultIndicatorPeriod !== period.key) {
        this.$router.replace({
          query: { view: targetView, resultIndicatorPeriod: period.key },
        });
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
