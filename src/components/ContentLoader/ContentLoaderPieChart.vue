<template>
  <div class="content-loader-pie-chart-container">
    <content-loader height="280" width="340">
      <circle cx="170" cy="150" r="100" />
    </content-loader>
  </div>
</template>

<script>
export default {
  name: 'ContentLoaderPieChart',
};
</script>

<style lang="scss" scoped>
.content-loader-pie-chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
