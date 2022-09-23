<template>
  <div>
    <div v-if="kpis.length">
      <button class="btn btn--ghost" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
    </div>
    <div v-else class="empty">
      <empty-state
        :icon="'lightbulb'"
        :heading="$t('empty.noKPIs.heading')"
        :body="$t('empty.noKPIs.body')"
      >
        <button class="btn btn--ter" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
      </empty-state>
    </div>
    <div v-if="kpis.length" class="kpis">
      <div v-for="kpi in kpis" :key="kpi.id" :class="{ 'kpi--error': !!kpi.error }">
        <ItemAdminKPI :kpi="kpi" />
      </div>
    </div>

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
  display: grid;
  grid-gap: span(0, 1);
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  margin-top: 1.5rem;

  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(10));
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.empty {
  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(10));
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.kpi {
  max-width: 30rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  &--error {
    box-shadow: 0 0 2px 3px rgba(var(--color-red-rgb), 0.4);
  }
}
</style>
