<template>
  <div>
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <router-link class="product-header__back" :to="{ name: 'home' }">Tilbake</router-link>
          <div class="product-header__name">
            <h1 class="title-1">{{ product.product }}</h1>
          </div>

          <img
            :src="getProductImage"
            :alt="`Profilbilde for ${product.product}`"
            class="product-header__profile-image"
          />
          <router-link class="product-header__edit" :to="{ name: 'edit-product', params: { id: $route.params.id } }">
            Endre produkt
          </router-link>
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <template v-for="(quarter, index) in quarters">
          <button
            class="button--tab"
            :class="{ active: chosenQuarter === quarter }"
            :key="`${quarter}-${index}`"
            @click="activeQuarter(quarter)"
          >
            {{ quarter }}
          </button>
        </template>
      </div>
    </nav>

    <div class="content">
      <div class="container container--sidebar">
        <div class="grid-3">
          <section class="section">
            <h2 class="title-2">Oppdrag</h2>
            <p>
              {{ product.mission_statement }}
            </p>
          </section>

          <section class="section">
            <h2 class="title-2">Team</h2>
            <ul class="team__list">
              <li v-for="user in product.team" :key="user.id" class="team__member">
                <img :src="user.photo ? user.photo : '/placeholder-user.svg'" :alt="user.name" class="team__image" />
                <div class="team__name">
                  <span>
                    {{ user.name }}
                  </span>
                </div>
              </li>
            </ul>
          </section>

          <section class="section">
            <h2 class="title-2">Fremdrift denne perioden</h2>
            <pie-chart :product="product"></pie-chart>
          </section>
        </div>

        <hr />

        <section class="section">
          <h2 class="title-2">Mål</h2>

          <p v-if="!product.children || !product.children.length">
            <strong>Oops! Det finnes ingen mål akkurat nå! </strong>
            <router-link :to="{ name: 'edit-product-objectives', params: { id: $route.params.id } }"
              >Legg til et mål</router-link
            >
          </p>

          <ul class="grid-3">
            <li v-for="objective in product.children" :key="objective.id">
              <the-objective :objective="objective"></the-objective>
            </li>
          </ul>
        </section>

        <hr />

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

<style lang="scss" scoped>
@import '../styles/colors';

.button--tab {
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

.team {
  &__list {
    display: flex;
    flex-wrap: wrap;
    margin: -0.25rem;
  }

  &__member {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0.25rem;
    text-align: center;

    &:hover .team__name {
      transform: translateY(0);
      opacity: 1;
    }
  }

  &__image {
    width: 5rem;
    height: 5rem;
    border-radius: 2.5rem;
  }

  &__name {
    position: absolute;
    top: 5rem;
    left: -50%;
    z-index: 2;
    display: flex;
    justify-content: center;
    width: 200%;
    color: white;
    transform: translateY(-1rem);
    opacity: 0;
    transition: all 0.12s ease-in-out;
    user-select: none;
    pointer-events: none;

    & > span {
      padding: 0.25rem 0.5rem;
      background: $color-purple;
    }
  }
}
</style>
