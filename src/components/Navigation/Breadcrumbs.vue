<template>
  <div class="breadcrumbs">
    <nav class="breadcrumbs__nav">
      <router-link :to="`/`">Hjem</router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumbs {
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 3px 5px rgba(black, 0.1);
  @include container();
}

.breadcrumbs__nav {
  display: block;
  margin-left: span(2, 1);
}
</style>
