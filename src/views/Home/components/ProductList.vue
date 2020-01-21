<template>
  <div>
    <ul>
      <section v-for="org in nest" :key="org.id">
        <PageHeader :data="org"></PageHeader>
        <div class="container">
          <ul class="org">
            <li v-for="dept in org.departments" class="department" :key="dept.id">
              <router-link v-if="dept.slug" :to="{ name: 'department', params: { slug: dept.slug } }">
                <h2 class="department__name title title-3">{{ dept.name }}</h2>
              </router-link>
              <ul class="product__list">
                <li v-for="product in dept.products" class="product" :key="product.id">
                  <router-link v-if="product.slug" :to="{ name: 'product', params: { slug: product.slug } }">
                    <h3 class="product__name">
                      <img
                        class="product__image"
                        :src="product.photoURL || '/placeholder-image.svg'"
                        :alt="product.name"
                      />
                      <span>{{ product.name }}</span>
                      <i class="fa fa-arrow-right"></i>
                    </h3>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PageHeader from '@/components/PageHeader.vue';

export default {
  computed: {
    ...mapState(['nest']),
  },
  components: {
    PageHeader,
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.org {
  display: grid;
  grid-gap: 5rem 2rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  margin: 2rem 0;
}

.department {
  &__name {
    margin-bottom: 2rem;
  }
}

.product {
  &__image {
    width: 3rem;
    height: 3rem;
    margin-right: 0.75rem;
    border-radius: 50%;
  }

  &__name {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 0 -0.25rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    border-radius: 1rem;

    &:hover {
      background: $color-bg;

      .fa {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .fa {
      margin-left: auto;
      transform: translateX(-0.75rem);
      opacity: 0;
      transition: all 0.2s ease-out;
    }
  }
}
</style>
