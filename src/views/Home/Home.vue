<template>
  <div>
    <div class="home">
      <ProductList class="productList"></ProductList>
    </div>
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue';

export default {
  components: { ProductList },
};
</script>
