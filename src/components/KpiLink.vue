<template>
  <router-link
    v-tooltip="kpi.name"
    :to="{ name: 'KpiHome', params: { kpiId: kpi.id } }"
    class="kpiLink"
    :class="{ kpiLink: true, 'kpiLink--isDisabled': kpi.error }"
  >
    <KPI :kpi="kpi" />
  </router-link>
</template>

<script>
export default {
  name: 'KpiLink',

  components: {
    KPI: () => import('@/components/KPI.vue'),
  },

  props: {
    kpi: {
      type: Object,
      required: false,
      default: null,
    },
  },
};
</script>

<style lang="scss" scoped>
.kpiLink {
  text-decoration: none;

  & .kpi {
    &:hover {
      color: var(--color-text-secondary);
      background: var(--color-hover);
    }
  }

  &--isDisabled {
    opacity: 0.25;
  }
}
</style>
