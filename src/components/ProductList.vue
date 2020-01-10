<template>
  <div>
    <div class="content">
      <ul>
        <li v-for="org in nest" :key="org.id">
          <h1 class="title-1">{{ org.name }}</h1>
          <ul class="org">
            <li v-for="dept in org.departments" class="department" :key="dept.id">
              <h2 class="department__name">{{ dept.name }}</h2>
              <ul>
                <li v-for="product in dept.products" class="product" :key="product.id">
                  <router-link :to="{ name: 'product', params: { slug: product.slug, ref: product } }">
                    <h3 class="product__name">{{ product.name }}</h3>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['nest']),
  },
};
</script>

<style lang="scss" scoped>
.org {
  display: grid;
  grid-gap: 5rem 2rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  margin: 2rem 0;
}

.department {
  &__name {
    margin-bottom: 1rem;
    padding: 1rem 0;
    font-size: 1.25rem;
    border-top: 5px solid rgba(black, 0.1);
    border-bottom: 1px solid rgba(black, 0.1);
  }
}

.product {
  &__name {
    position: relative;
    margin: 0 -0.25rem;
    padding: 0.25rem;
    font-size: 1.25rem;

    &:hover {
      background: #f4f4f4;
    }

    &::after {
      position: absolute;
      top: 0;
      right: 0.5rem;
      display: block;
      font-family: Arial, Helvetica, sans-serif;
      content: '→';
    }
  }
}
</style>
