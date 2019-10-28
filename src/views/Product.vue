<template>
  <div>
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <router-link class="back" :to="{ name: 'home' }">Tilbake</router-link>
          <div class="product-header__name">
            <h1 class="title-1">{{ product.product }}</h1>
          </div>

          <img :src="getProductImage" :alt="`Profilbilde for ${product.product}`" class="profile-image" />
          <router-link class="edit" :to="{ name: 'edit-product', params: { id: $route.params.id } }">
            Endre produkt
          </router-link>
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="tabs">
          <template v-for="(quarter, index) in quarters">
            <button
              class="button"
              :class="{ active: chosenQuarter === quarter }"
              :key="`${quarter}-${index}`"
              @click="activeQuarter(quarter)"
            >
              {{ quarter }}
            </button>
          </template>
        </div>
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
        <h2 class="title-2">Fremdrift denne perioden</h2>
        <pie-chart :product="product"></pie-chart>
      </section>

      <section class="section">
        <h2 class="title-2">Mål</h2>

        <p v-if="!product.children || !product.children.length">
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

      <section class="section" v-if="product.children && product.children.length">
        <h2 class="title-2">Nøkkelresultater</h2>

        <div class="grid-3">
          <template v-for="objective in product.children">
            <the-key-result v-for="keyres in objective.children" :key="keyres.id" :id="keyres.id"></the-key-result>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import TheObjective from '@/components/TheObjective.vue';
import TheKeyResult from '@/components/TheKeyResult.vue';
import PieChart from '@/components/PieChart.vue';

export default {
  name: 'Product',

  components: {
    TheObjective,
    TheKeyResult,
    PieChart,
  },

  mounted() {
    this.resetState();
  },

  computed: {
    ...mapState(['chosenQuarter']),
    ...mapGetters(['getObjectById', 'getDistinctQuarters', 'getProductWithDistinctObjectives']),
    product() {
      return this.getProductWithDistinctObjectives(this.$route.params.id, this.chosenQuarter);
    },

    getProductImage() {
      return this.product.product_image ? this.product.product_image : '/placeholder-image.svg';
    },

    quarters() {
      return this.getDistinctQuarters(this.$route.params.id);
    },
  },

  methods: {
    ...mapActions(['resetState', 'setChosenQuarter']),
    activeQuarter(quarter) {
      this.setChosenQuarter(quarter);
    },
  },
};
</script>

<style lang="scss">
@import '../styles/colors';

.product-header {
  height: 30rem;
  text-align: center;

  @media screen and (min-width: 768px) {
    height: 11rem;
    text-align: left;
  }

  background: $color-yellow;

  &__container {
    display: grid;
    grid-gap: 0.5rem 1rem;

    grid-template-rows: 4rem 3fr 14rem 3rem 1fr;
    grid-template-columns: 1fr;

    @media screen and (min-width: 768px) {
      grid-template-rows: 3rem 2rem 1fr;
      grid-template-columns: 13rem 1fr auto;
    }
  }

  &__name {
    grid-row: 4;

    @media screen and (min-width: 768px) {
      grid-row: 3;
      grid-column: 2 / span 2;
    }
  }

  .edit {
    grid-row: 2;
    grid-column: 1;
    padding: 1rem 0;

    @media screen and (min-width: 768px) {
      grid-row: 1;
      grid-column: 3;
      padding: 1rem 0;
    }
  }

  .back {
    display: block;
    grid-row: 1;
    grid-column: 1;
    padding: 1rem 0;

    @media screen and (min-width: 768px) {
      grid-row: 1;
      grid-column: 1 / span 2;
      padding: 1rem 0;
    }
  }

  .profile-image {
    z-index: 2;
    display: block;
    grid-row: 3;
    grid-column: 1;
    justify-self: center;
    box-sizing: content-box;
    width: 12rem;
    height: 12rem;
    object-fit: cover;
    background: #eeeeee;

    border: 6px solid white;
    box-shadow: 0 3px 5px rgba(black, 0.2);

    @media screen and (min-width: 768px) {
      grid-row: 2;
      grid-column: 1;
      transform: translateX(-6px);
    }
  }
}

.button {
  position: relative;
  display: inline-block;
  padding: 0.75rem 0.5rem;
  color: $color-purple;
  background: none;

  border: none;

  &.active {
    position: relative;
    cursor: default;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 4px;
      background-color: $color-purple;
      content: '';
    }
  }
}
</style>
