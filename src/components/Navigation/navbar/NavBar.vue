<template>
  <nav class="nav-bar">
    <slot />
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
};
</script>

<style lang="scss" scoped>
.nav-bar {
  display: flex;
}
</style>
