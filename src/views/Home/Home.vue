<template>
  <div class="home">
    <ProductList class="productList"></ProductList>
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue';

export default {
  components: { ProductList },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';
.home {
  background: $color-bg;
}
</style>
