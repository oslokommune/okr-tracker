<template>
  <div>
    <header class="product-header">
      <div class="container">
        <router-link :to="{ name: 'home' }">Tilbake</router-link>
        <h1 class="title-1">{{ product.product }}</h1>
        <router-link :to="{ name: 'edit-product', params: { id: $route.params.id } }">
          Endre produkt
        </router-link>
      </div>
    </header>

    <nav class="container">
      <!-- select quarters here? -->
    </nav>

    <div class="page container">
      <section class="section">
        <h2 class="title-2">Oppdrag</h2>
        <p>
          {{ product.mission_statement }}
        </p>
      </section>

      <section class="section">
        <h2 class="title-2">Mål</h2>
        <ul class="grid-3">
          <li v-for="objective in product.children" :key="objective.id">
            <the-objective :objective="objective"></the-objective>
          </li>
        </ul>
      </section>

      <section class="section">
        <h2 class="title-2">Nøkkelresultater</h2>

        <div v-for="objective in product.children" :key="objective.id">
          <ul>
            <li v-for="keyres in objective.children" :key="keyres.id">
              <p>
                <strong>{{ objective.objective_title }}</strong>
                {{ keyres.key_result }}
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import TheObjective from '@/components/TheObjective.vue';

export default {
  name: 'Product',

  components: {
    TheObjective,
  },

  computed: {
    product() {
      let product = this.$store.getters.getObjectById(this.$route.params.id);

      // filter objectives by quarter here?

      return product;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.product-header {
  height: 14rem;
  margin: 0;
  padding: 1rem 0;

  background: $color-yellow;
}
</style>
