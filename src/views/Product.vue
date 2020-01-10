<template>
  <div v-if="product">
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <div class="product-header__name">
            <h1 class="title-1">{{ product.name }}</h1>
          </div>

          <img
            v-if="product.photoURL"
            :src="product.photoURL"
            :alt="`Profilbilde for ${product.name}`"
            class="product-header__profile-image"
          />
          <span class="product-header__edit">
            <router-link :to="{ name: 'edit-product', params: { slug: $route.params.slug } }">
              Endre produkt
            </router-link>
          </span>
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <a
          v-for="(quarter, i) in quarters"
          :key="quarter.name"
          class="sub-nav__element"
          href="#"
          :class="{ 'router-link-active': quarter.isCurrent }"
          @click="setQuarter(i)"
          >{{ quarter.name }}</a
        >
      </div>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '../config/firebaseConfig';

export default {
  name: 'Product',

  data: () => ({
    product: null,
  }),

  computed: {
    ...mapState(['quarters']),
  },

  mounted() {
    db.collectionGroup('products')
      .where('slug', '==', this.$route.params.slug)
      .get()
      .then(async d => {
        const foo = await d.docs[0].ref.get();
        this.product = foo.data();
      });
  },

  methods: {
    setQuarter(targetIndex) {
      this.quarters.forEach((quarter, i) => {
        quarter.isCurrent = targetIndex === i;
      });
      // this.quarters[i].isCurrent = true;
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
