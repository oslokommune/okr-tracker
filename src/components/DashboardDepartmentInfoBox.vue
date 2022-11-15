<template>
  <div class="dashboardDepartmentInfoBox">
    <h3 class="title-2"><slot name="icon" />{{ title }}</h3>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DashboardDepartmentInfoBox',

  props: {
    icon: {
      type: Function,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboardDepartmentInfoBox {
  flex: 0 0 calc(50% - 1.25rem);
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;

  .title-2 {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    svg {
      margin-right: 0.5rem;
    }
  }
}
</style>
