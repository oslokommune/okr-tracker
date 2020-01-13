<template>
  <div v-if="product">
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <router-link class="product-header__edit" :to="{ name: 'product', params: { id: $route.params.id } }">
            Gå tilbake til {{ product.name }}
          </router-link>
          <div class="product-header__name">
            <h1 class="title-1">Endre «{{ product.name }}»</h1>
          </div>

          <img
            :src="product.photoURL || ''"
            :alt="`Profilbilde for ${product.name}`"
            class="product-header__profile-image"
          />
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <router-link class="sub-nav__element" exact :to="{ name: 'edit-product' }">Detaljer</router-link>
        <router-link class="sub-nav__element" :to="{ name: 'edit-product-objectives' }">Mål</router-link>
        <!-- <router-link class="sub-nav__element" :to="{ name: 'edit-product-keyres' }">Nøkkelresultater</router-link> -->
      </div>
    </nav>

    <div class="content container container--sidebar">
      <router-view :docref="product.ref"></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { productListener, isTeamMemberOfProduct } from '../util/db';

export default {
  name: 'Product',

  data: () => ({
    product: null,
  }),

  computed: {
    ...mapState(['user']),
  },

  async beforeRouteEnter(to, from, next) {
    if (await isTeamMemberOfProduct(to.params.slug)) {
      next();
    } else {
      next('/');
      throw new Error('You do not have access to this page!');
    }
  },

  created() {
    productListener.call(this, this.$route.params.slug);
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.product-header {
  background: #cccccc;
}
</style>
