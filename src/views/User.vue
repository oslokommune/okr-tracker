<template>
  <div v-if="user">
    <PageHeader :data="user"></PageHeader>
    <div class="container container--sidebar">
      <main class="content--main">
        <section v-if="user.admin" class="section">
          <h2 class="title title-2">Admin</h2>
          <p>Har administratortilgang</p>
        </section>
        <section class="section">
          <h2 class="title title-2">Mine produkter</h2>
          <ul>
            <li v-for="product in products" :key="product.id">
              <router-link :to="{ name: 'product', params: { slug: product.slug } }">
                <div style="display: flex; flex-direction: row;">
                  <img
                    class="team__image"
                    :src="product.photoURL || '/placeholder-user.svg'"
                    :alt="product.name"
                    v-tooltip.auto="product.name"
                  />
                  <div>
                    <h2 class="title title-2" style="alight-items: center; padding-left: 1rem;">{{ product.name }}</h2>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { isDashboardUser, findUser, userProductsListener } from '../util/db';
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'User',

  data: () => ({
    products: [],
    user: null,
  }),

  components: {
    PageHeader,
  },

  beforeRouteEnter(to, from, next) {
    if (isDashboardUser()) {
      next(false);
    } else {
      next();
    }
  },

  async mounted() {
    await findUser(this.$route.params.slug).then(user => {
      this.user = user;
    });

    userProductsListener(this.user).then(list => {
      this.products = list;
    });
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.uploading {
  opacity: 0.2;
}

.page-header__name {
  margin: -1rem -1rem 0;
  padding: 1rem 1rem 0;

  .title-1 {
    &::after {
      bottom: 0.4rem;
      display: inline-flex;
      align-content: center;
      align-items: center;
      margin-left: 1.5rem;
      padding: 0.4rem 0.75rem 0.25rem;
      font-weight: normal;
      font-size: 1rem;
      border: 1px solid white;
      transform: translateY(-0.25rem);
      opacity: 0.45;
      content: 'Endre';
    }
  }

  &:hover {
    background: rgba(white, 0.2);

    .title-1::after {
      opacity: 0;
    }
  }
}

.team {
  &__list {
    display: flex;
    flex-wrap: wrap;
    margin: -0.25rem;

    &--empty {
      margin-bottom: 1rem;
    }
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
    border: 0.4rem solid white;
    border-radius: 0.8rem;

    -moz-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    -webkit-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
  }
}
</style>
