<template>
  <section class="kpis">
    <h2 class="title-2">KPI-er</h2>
    {{ kpis }}
  </section>
</template>

<script>
export default {
  props: {
    kpis: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.kpis {
  margin-bottom: 1.5rem;
}
</style>
