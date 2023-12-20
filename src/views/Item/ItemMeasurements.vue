<template>
  <div class="measurements-page">
    <div v-if="allKpis.length" class="measurements-page__header">
      <h1 class="pkt-txt-16-medium pkt-hide-phablet-up">
        {{ $t('general.KPIs') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-phablet-up pkt-hide-tablet-up">
        {{ $t('general.KPIs') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-tablet-up">
        {{ $t('general.KPIsLong', { name: activeItem.name }) }}
      </h1>
    </div>

    <div v-if="hasEditRights" class="measurements-page__actions">
      <pkt-button
        :text="$t('general.KPI')"
        :aria-label="$t('admin.measurement.new')"
        skin="primary"
        size="small"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="openKpiDrawer(false)"
      />
    </div>

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
        <kpi-details v-if="activeKpi" :kpi="activeKpi" @edit-kpi="openKpiDrawer(true)" />
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
      :body="$t(hasEditRights ? 'empty.noKPIs.adminBody' : 'empty.noKPIs.body')"
    >
      <div v-if="hasEditRights" data-mode="dark">
        <pkt-button
          :text="$t('empty.noKPIs.buttonText')"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="openKpiDrawer(false)"
        />
      </div>
    </empty-page>

    <kpi-drawer
      v-if="hasEditRights && showKpiDrawer"
      :kpi="drawerEditMode ? activeKpi : null"
      @create="kpiCreated"
      @close="showKpiDrawer = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import KpiDetails from '@/components/KpiDetails.vue';
import KpiDrawer from '@/components/drawers/KpiDrawer.vue';
import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

export default {
  name: 'ItemMeasurements',

  components: {
    KpiWidgetGroup,
    KpiDetails,
    EmptyPage,
    NotFoundPage,
    PktButton,
    KpiDrawer,
  },

  data: () => ({
    showKpiDetails: true,
    showKpiDrawer: false,
    drawerEditMode: false,
    activeKpiId: null,
  }),

  computed: {
    ...mapState(['activeItem']),
    ...mapState('kpis', ['selectedPeriod', 'kpis', 'subKpis']),
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

    activeKpi() {
      return this.allKpis.find((k) => k.id === this.activeKpiId) || null;
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
          this.activeKpiId = this.allKpis.find((k) => k.id === kpiId) ? kpiId : null;
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

  methods: {
    openKpiDrawer(edit) {
      this.drawerEditMode = edit;
      this.showKpiDrawer = true;
    },
    kpiCreated(kpi) {
      const { params, query } = this.$route;
      this.$router.push({
        name: 'ItemMeasurements',
        params: { ...params, kpiId: kpi.id },
        query,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.measurements-page {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;

  &__header {
    padding: 0 1.5rem;

    h1 {
      line-height: 4.25rem;
    }
  }

  &__actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  ::v-deep .page__container {
    padding-top: 0.5rem;
  }
}
</style>
