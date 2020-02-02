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
          <ul class="products">
            <li v-for="product in products" :key="product.id">
              <router-link :to="{ name: 'product', params: { slug: product.slug } }">
                <div clasS="product">
                  <img class="product__image" :src="product.photoURL || '/placeholder-user.svg'" :alt="product.name" />
                  <div class="product__title">
                    <h2>{{ getDepartment(product) }}</h2>
                    <h2>{{ product.name }}</h2>
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
import { isDashboardUser, findUser, userProductsListener, getAllDepartments } from '../util/db';
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'User',

  data: () => ({
    products: [],
    user: null,
    departments: [],
  }),

  components: {
    PageHeader,
  },

  methods: {
    getDepartment(product) {
      let foundDep = '';
      this.departments.forEach(dep => {
        if (dep.id === product.ref.parent.parent.id) {
          foundDep = dep.name;
        }
      });
      return foundDep;
    },
  },

  beforeRouteEnter(to, from, next) {
    if (isDashboardUser()) {
      next(false);
    } else {
      next();
    }
  },

  async mounted() {
    await findUser(this.$route.params.slug).then(list => {
      this.user = list;
    });

    userProductsListener(this.user).then(list => {
      this.products = list;
    });

    await getAllDepartments().then(list => {
      this.departments = list;
    });
  },
};
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  flex-direction: row;

  &__image {
    width: 4rem;
    height: 4rem;
    border: 0.4rem solid white;
    border-radius: 0.8rem;

    -moz-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    -webkit-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
  }

  &__title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 1rem;
  }
}

.products {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin: 2rem 0;

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>
