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
  margin: 4rem auto;
  max-width: 75.5rem;

  &__wrapper {
    margin: 0 1rem;
  }

  .title-1 {
    color: var(--color-text);
    font-weight: 500;
  }
}
</style>
