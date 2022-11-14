<template>
  <div class="form-wrapper">
    <div v-if="kpis.length">
      <button class="btn btn--ghost" @click="showAddKPIModal = true">
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
      <button class="btn btn--ter" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
    </empty-state>

    <add-kpi-modal
      v-if="showAddKPIModal"
      @add="kpiAdded"
      @close="showAddKPIModal = false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ItemAdminKPIs',

  components: {
    AddKpiModal: () => import('@/components/modals/AddKPIModal.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    ItemAdminKPI: () => import('@/views/ItemAdmin/ItemAdminKPI.vue'),
  },

  data: () => ({
    selectedKpiId: null,
    showAddKPIModal: false,
  }),

  computed: {
    ...mapState(['kpis']),
    orderedKpis() {
      const kpiOrder = ['ri', 'keyfig', 'plain'];
      return this.kpis
        .map((x) => x)
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort(
          (a, b) => kpiOrder.indexOf(a.kpiType) - kpiOrder.indexOf(b.kpiType)
        );
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
    scrollToKpi(kpiId) {
      this.$nextTick(() => {
        const kpiEl = document.getElementById(kpiId);
        if (kpiEl) {
          window.scrollTo({ top: kpiEl.offsetTop, behavior: 'smooth' });
        }
      });
    },
    kpiAdded(kpiId) {
      this.selectedKpiId = kpiId;
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
