<template>
  <router-link
    v-tooltip="kpi.name"
    :to="{ name: 'KpiHome', params: { kpiId: kpi.id } }"
    class="kpi-link"
    :class="{ 'kpi-link--isDisabled': kpi.error }"
  >
    <kpi-card :kpi="kpi" />
  </router-link>
</template>

<script>
import KpiCard from './KpiCard.vue';

export default {
  name: 'KpiLink',

  components: {
    KpiCard,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
      default: null,
    },
  },
};
</script>

<style lang="scss" scoped>
.kpi-link {
  text-decoration: none;

  & .kpi-card:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);
  }

  &--isDisabled {
    opacity: 0.25;
  }
}
</style>
