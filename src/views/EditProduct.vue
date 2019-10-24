<template>
  <div v-if="product">
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <router-link class="edit" :to="{ name: 'product', params: { id: $route.params.id } }">
            Gå tilbake til {{ product.product }}
          </router-link>
          <div class="product-header__name">
            <h1 class="title-1">Endre «{{ product.product }}»</h1>
          </div>

          <img :src="getProductImage" :alt="`Profilbilde for ${product.product}`" class="profile-image" />
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <router-link class="sub-nav__element" :to="{ name: 'edit-product' }">Detaljer</router-link>
        <router-link class="sub-nav__element" :to="{ name: 'edit-product-objectives' }">Mål</router-link>
        <router-link class="sub-nav__element" :to="{ name: 'edit-product-keyres' }">Nøkkelresultater</router-link>
      </div>
    </nav>

    <div class="content container container--sidebar">
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
    getProductImage() {
      return this.product.product_image ? this.product.product_image : '/placeholder-image.svg';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.product-header {
  background: #cccccc;
}
</style>
