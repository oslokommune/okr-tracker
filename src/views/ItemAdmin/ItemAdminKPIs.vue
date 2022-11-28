<template>
  <div class="form-wrapper">
    <div v-if="kpis.length">
      <button class="btn btn--ghost" :disabled="loading" @click="createKpi">
        {{ $t('kpi.add') }}
      </button>

      <div class="kpis">
        <ItemAdminKPI
          v-for="kpi in orderedKpis"
          :key="kpi.id"
          :kpi="kpi"
          :visible="selectedKpiId === kpi.id"
          @toggle="kpiToggled"
          @hook:mounted="kpiMounted(kpi.id)"
        />
      </div>
    </div>

    <empty-state
      v-else
      :icon="'lightbulb'"
      :heading="$t('empty.noKPIs.heading')"
      :body="$t('empty.noKPIs.adminBody')"
    >
      <button class="btn btn--ter" :disabled="loading" @click="createKpi">
        {{ $t('kpi.add') }}
      </button>
    </empty-state>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';

export default {
  name: 'ItemAdminKPIs',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ItemAdminKPI: () => import('@/views/ItemAdmin/ItemAdminKPI.vue'),
  },

  data: () => ({
    selectedKpiId: null,
    loading: false,
  }),

  computed: {
    ...mapState(['kpis', 'activeItemRef']),

    orderedKpis() {
      const kpiOrder = ['ri', 'keyfig', 'plain'];
      return this.kpis
        .map((x) => x)
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => kpiOrder.indexOf(a.kpiType) - kpiOrder.indexOf(b.kpiType));
    },

    anchoredKpiId() {
      const { hash } = this.$route;
      return hash ? hash.substring(1) : null;
    },
  },

  watch: {
    anchoredKpiId: {
      immediate: true,
      async handler(kpiId) {
        if (kpiId && this.kpis.map((kpi) => kpi.id).includes(kpiId)) {
          this.selectedKpiId = kpiId;
        }
      },
    },

    selectedKpiId(kpiId) {
      const { name, query, hash } = this.$route;
      const kpiHash = kpiId ? `#${kpiId}` : '';
      if (hash !== kpiHash) {
        this.$router.replace({ name, query, hash: kpiHash });
      }
    },

    kpis() {
      if (this.selectedKpiId) {
        // Update the scroll position if the order of KPIs changes.
        this.scrollToKpi(this.selectedKpiId);
      }
    },
  },

  methods: {
    async createKpi() {
      this.loading = true;

      const data = {
        parent: this.activeItemRef,
        name: this.$t('kpi.placeholderName'),
        description: '',
        format: 'integer',
        preferredTrend: 'increase',
        kpiType: 'plain',
        updateFrequency: 'daily',
        sheetId: '',
        sheetName: '',
        sheetCell: '',
        api: true,
        auto: false,
      };

      try {
        const KpiRef = await Kpi.create(data);
        this.$toasted.show(this.$t('toaster.add.kpi'));
        this.selectedKpiId = KpiRef.id;
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.kpi'));
        throw new Error(error);
      } finally {
        this.loading = false;
      }
    },

    scrollToKpi(kpiId) {
      this.$nextTick(() => {
        const kpiEl = document.getElementById(kpiId);
        if (kpiEl) {
          window.scrollTo({ top: kpiEl.offsetTop, behavior: 'smooth' });
        }
      });
    },

    kpiToggled(open, kpi) {
      if (open) {
        this.selectedKpiId = kpi.id;
      } else if (this.selectedKpiId === kpi.id) {
        this.selectedKpiId = null;
      }
    },

    kpiMounted(kpiId) {
      if (kpiId === this.selectedKpiId) {
        this.scrollToKpi(kpiId);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.kpis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
}
</style>
