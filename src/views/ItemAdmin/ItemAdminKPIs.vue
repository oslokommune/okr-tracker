<template>
  <div class="form-wrapper">
    <div v-if="kpis.length">
      <button class="btn btn--ghost" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
      <div class="kpis">
        <div v-for="kpi in kpis" :key="kpi.id">
          <ItemAdminKPI :kpi="kpi" />
        </div>
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

    <add-kpi-modal v-if="showAddKPIModal" @close="showAddKPIModal = false" />
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
    showAddKPIModal: false,
  }),

  computed: {
    ...mapState(['kpis']),
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
