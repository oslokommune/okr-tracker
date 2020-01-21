<template>
  <div>
    <ProductList></ProductList>
    <Newsfeed></Newsfeed>
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue';
import Newsfeed from './components/Newsfeed.vue';

export default {
  components: { ProductList, Newsfeed },
};
</script>
