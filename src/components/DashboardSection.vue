<template>
  <section class="dashboardSection">
    <div class="dashboardSection__wrapper">
      <slot name="title" />
      <slot name="content" />
    </div>
  </section>
</template>

<script>
export default {
  name: 'DashboardSection',
};
</script>

<style lang="scss" scoped>
.dashboardSection {
  max-width: 75.5rem;
  margin: 4rem auto;

  &__wrapper {
    margin: 0 1rem;
  }

  .title-1 {
    color: var(--color-text);
    font-weight: 500;
  }
}
</style>
