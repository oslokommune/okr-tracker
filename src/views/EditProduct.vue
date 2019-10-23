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

    <div class="page container">
      <nav class="nav">
        <router-link :to="{ name: 'edit-product' }">Profil</router-link>
        <router-link :to="{ name: 'edit-product-objectives' }">Mål</router-link>
        <router-link :to="{ name: 'edit-product-keyres' }">Nøkkelresultater</router-link>
      </nav>

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
.nav {
  display: flex;

  a {
    display: block;
    padding: 0.5rem;
  }
}
</style>
