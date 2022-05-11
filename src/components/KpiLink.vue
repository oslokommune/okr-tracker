<template>
  <router-link
    v-if="kpi"
    v-tooltip="kpiName(kpiType, kpi)"
    :to="{ name: 'KpiHome', params: { kpiId: kpi.id } }"
    class="kpiLink"
    :class="{ kpiLink: true, 'kpiLink--isDisabled': kpi.error }"
  >
    <KPI :kpi-type="kpiType" :kpi="kpi" />
  </router-link>
  <KPI v-else :kpi-type="kpiType" :kpi="kpi" />
</template>

<script>
import { kpiName } from '@/util/kpiHelpers';

export default {
  name: 'KpiLink',

  components: {
    KPI: () => import('@/components/KPI.vue'),
  },

  props: {
    kpiType: {
      type: String,
      required: true,
    },
    kpi: {
      type: Object,
      required: false,
      default: null,
    },
  },

  methods: {
    kpiName,
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
