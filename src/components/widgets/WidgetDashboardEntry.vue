<template>
  <router-link
    class="widgetDashboardEntry btn"
    :to="{
      name: 'Dashboard',
      params: { slug },
    }"
  >
    <icon-graph class="widgetDashboardEntry__graphIcon" />
    {{ $t('general.dashboardEntry') }}
    <icon-chevron-right class="widgetDashboardEntry__chevronRightIcon" />
  </router-link>
</template>

<script>
import IconGraph from '@/components/IconGraph.vue';
import IconChevronRight from '@/components/IconChevronRight.vue';

export default {
  name: 'WidgetDashboardEntry',

  components: {
    IconGraph,
    IconChevronRight,
  },

  props: {
    slug: {
      type: String,
      required: true,
    },
  },

};
</script>

<style lang="scss" scoped>
.widgetDashboardEntry {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1.5rem 1rem;
  color: var(--color-primary);
  font-weight: 500;
  font-size: 1.125rem;
  background: var(--color-secondary-light);

  &__graphIcon {
    margin-right: 0.5rem;
  }

  &__chevronRightIcon {
    margin-left: auto;
  }

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);

    &::v-deep path {
      fill: white;
    }
  }
}
</style>
