<template>
  <router-link
    class="widgetDashboardEntry btn"
    :to="{
      name: 'Dashboard',
      params: { slug },
    }"
  >
    <pkt-icon name="graph" />
    <span>{{ $t('general.dashboardEntry') }}</span>
    <pkt-icon name="chevron-right" />
  </router-link>
</template>

<script>
export default {
  name: 'WidgetDashboardEntry',

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
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1.5rem 1rem;
  color: var(--color-primary);
  font-weight: 500;
  font-size: 1.125rem;
  background: var(--color-secondary-light);

  > span {
    flex-grow: 1;
  }

  > svg {
    height: 1.5rem;
    margin-right: 0.5rem;
  }

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);

    > svg {
      --fg-color: var(--color-white);
    }
  }
}
</style>
