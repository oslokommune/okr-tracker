<template>
  <div v-if="product">
    <PageHeader :data="product"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <router-link class="sub-nav__element" exact :to="{ name: 'edit-product' }">Produkt</router-link>
          <router-link class="sub-nav__element" :to="{ name: 'edit-product-keyres' }">
            Mål og nøkkelresultater
          </router-link>
          <router-link class="sub-nav__element" exact :to="{ name: 'home' }">Team</router-link>
        </div>
      </div>
    </nav>

    <div class="content">
      <router-view :docref="product.ref"></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { productListener, isTeamMemberOfProduct } from '../../db/db';
import PageHeader from '../../components/PageHeader.vue';

export default {
  name: 'EditProduct',

  components: {
    PageHeader,
  },

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
      next(false);
      throw new Error('You do not have access to this page!');
    }
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  created() {
    this.unsubscribe = productListener.call(this, this.$route.params.slug);
  },
};
</script>

<style lang="scss" scoped></style>
