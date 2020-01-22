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
                    <h3 class="product__item">
                      <img
                        class="product__image"
                        :src="product.photoURL || '/placeholder-image.svg'"
                        :alt="product.name"
                      />
                      <span class="product__name">{{ product.name }}</span>
                      <div class="progression">
                        <div
                          class="progression__bar"
                          v-if="product.progressions"
                          :style="`width:${product.progressions[quarters[0].name] * 100}%`"
                        ></div>
                      </div>
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
    ...mapState(['nest', 'quarters']),
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin: 2rem 0;
}

.department {
  &__name {
    margin-bottom: 2rem;
  }
}

.progression {
  position: relative;
  grid-row: 2;
  grid-column: 2;
  width: 100%;
  height: 6px;
  background: rgba(black, 0.075);
  border-radius: 3px;

  &__bar {
    height: 100%;
    background: $color-yellow;
    border-radius: 3px;
  }
}

.product {
  &__image {
    grid-row: 1 / span 2;
    grid-column: 1;
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 0.75rem;
    border-radius: 50%;
  }

  &__item {
    position: relative;
    display: grid;
    grid-gap: 0 0.75rem;
    grid-template-rows: auto auto;
    grid-template-columns: 2.5rem 1fr 1rem;
    align-items: center;
    justify-content: flex-start;
    margin: 0 -0.5rem;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    color: black;
    font-size: 1rem;
    border-radius: 1rem;

    &:hover {
      background: rgba($color-bg, 0.75);

      .fa {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .fa {
      grid-row: 1 / span 2;
      margin-left: auto;
      color: $color-grey-300;
      transform: translateX(-0.75rem);
      opacity: 0;
      transition: all 0.2s ease-out;
    }
  }
}
</style>
