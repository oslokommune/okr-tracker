<template>
  <div class="dashboardDepartmentInfoBox">
    <h3 class="title-2">{{ title }}</h3>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DashboardDepartmentInfoBox',

  props: {
    icon: {
      type: Function,
      required: true,
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
  font-family: 'Oslo Sans';
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--color-text);

  .title-2 {
    margin-bottom: 1rem;
  }
}
</style>
