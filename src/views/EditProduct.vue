<template>
  <div v-if="product">
    <header class="product-header">
      <div class="container">
        <router-link :to="{ name: 'product', params: { id: $route.params.id } }">
          Gå tilbake til {{ product.product }}
        </router-link>
        <h1 class="title-1">Endre «{{ product.product }}»</h1>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container">
        <router-link class="sub-nav__element" :to="{ name: 'edit-product' }">Detaljer</router-link>
        <router-link class="sub-nav__element" :to="{ name: 'edit-product-objectives' }">Mål</router-link>
        <router-link class="sub-nav__element" :to="{ name: 'edit-product-keyres' }">Nøkkelresultater</router-link>
      </div>
    </nav>

    <div class="page container">
      <router-view :product="product"></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Product',

  computed: {
    product() {
      return this.$store.getters.getObjectById(this.$route.params.id);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.product-header {
  height: 14rem;

  background: #cccccc;
}
</style>
