<template>
  <section class="dashboardSection">
    <slot name="title" />
    <slot name="content" />
  </section>
</template>

<script>
export default {
  name: 'DashboardSection',
};
</script>

<style lang="scss" scoped>
.dashboardSection {
  margin: 4rem 0;

  .title-1 {
    font-weight: 500;
  }
}
</style>
