<template>
  <div>
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <router-link class="back" :to="{ name: 'home' }">Tilbake</router-link>
          <div class="product-header__name">
            <h1 class="title-1">{{ product.product }}</h1>
          </div>

          <img
            src="https://source.unsplash.com/random"
            :alt="`Profilbilde for ${product.product}`"
            class="profile-image"
          />
          <router-link class="edit" :to="{ name: 'edit-product', params: { id: $route.params.id } }">
            Endre produkt
          </router-link>
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <router-link class="sub-nav__element" :to="{ name: 'product' }">Q3 2019</router-link>
      </div>
    </nav>

    <div class="content container container--sidebar">
      <section class="section">
        <h2 class="title-2">Oppdrag</h2>
        <p>
          {{ product.mission_statement }}
        </p>
      </section>

      <section class="section">
        <h2 class="title-2">Mål</h2>

        <p v-if="!product.children">
          <strong>Oops! Det finnes ingen mål akkurat nå! </strong>
          <router-link :to="{ name: 'edit-product-objectives', params: { id: product.id } }"
            >Legg til et mål</router-link
          >
        </p>

        <ul class="grid-3">
          <li v-for="objective in product.children" :key="objective.id">
            <the-objective :objective="objective"></the-objective>
          </li>
        </ul>
      </section>

      <section class="section" v-if="product.children">
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

<style lang="scss">
@import '../styles/colors';

.product-header {
  height: 11rem;

  background: $color-yellow;

  &__container {
    display: grid;
    grid-gap: 0.5rem 1rem;
    grid-template-rows: 3rem 2rem 1fr;
    grid-template-columns: 13rem 1fr auto;
  }

  &__name {
    grid-row: 3;
    grid-column: 2 / span 2;
  }

  .edit {
    grid-row: 1;
    grid-column: 3;
    padding: 1rem 0;
  }

  .back {
    display: block;
    grid-row: 1;
    grid-column: 1 / span 2;
    padding: 1rem 0;
  }

  .profile-image {
    z-index: 2;

    display: block;
    grid-row: 2;
    grid-column: 1;
    box-sizing: content-box;
    width: 12rem;
    height: 12rem;

    background: #eeeeee;

    border: 6px solid white;
    box-shadow: 0 3px 5px rgba(black, 0.2);
    transform: translateX(-6px);
  }
}
</style>
