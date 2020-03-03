<template>
  <div>
    <ul>
      <section v-for="org in nest" :key="org.id">
        <PageHeader :data="org"></PageHeader>
        <div class="container">
          <div class="toggle__wrapper">
            <span class="toggle__label">Vis detaljer</span>
            <label class="toggle">
              <input class="toggle__input" type="checkbox" v-model="expandProducts" />
              <span class="toggle__switch"></span>
            </label>
          </div>

          <ul class="org">
            <li v-for="dept in org.departments" class="department" :key="dept.id">
              <router-link v-if="dept.slug" :to="{ name: 'department', params: { slug: dept.slug } }">
                <h2
                  class="department__name title title-3"
                  v-tooltip.top-start="{ content: `Se detaljer for tjenesteområdet`, delay: { show: 300, hide: 50 } }"
                >
                  {{ dept.name }}
                </h2>
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
                      <span class="product__edited edited" v-show="expandProducts">
                        Sist oppdatert {{ getEdited(product) }}
                      </span>
                      <div class="progression">
                        <SimpleProgress :document="product"></SimpleProgress>
                      </div>
                      <i class="fa fa-arrow-right"></i>
                    </h3>
                  </router-link>
                  <transition name="expand">
                    <product-details v-show="expandProducts" :product="product" class="details"></product-details>
                  </transition>
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
import { timeFromNow } from '@/util/utils';
import ProductDetails from '@/views/Home/components/ProductDetails.vue';
import SimpleProgress from '@/views/Home/components/SimpleProgress.vue';

export default {
  data: () => ({
    expandProducts: false,
  }),

  computed: {
    ...mapState(['nest']),
  },
  components: {
    PageHeader,
    ProductDetails,
    SimpleProgress,
  },
  methods: {
    getEdited(doc) {
      if (!doc) return null;
      const timestamp = doc.edited || doc.created;
      return timeFromNow(timestamp.toDate());
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.org {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin: 2rem 0;

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}

.department {
  padding: 1.5rem 1rem 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.15rem 0.25rem rgba(black, 0.15);
  &__name {
    margin-top: 0;
    margin-right: 2.25rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $color-border;
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
    width: 0%;
    height: 100%;
    background: $color-purple;
    border-radius: 3px;
  }
}

.product {
  &__image {
    grid-row: 1 / span all;
    grid-column: 1;
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 0.75rem;
    border-radius: 50%;
  }

  &__edited {
    grid-row: 3;
    grid-column: 2;
    padding-top: 0.1rem;
  }

  &__item {
    position: relative;
    display: grid;
    grid-gap: 0.15rem 0.75rem;
    grid-template-rows: auto auto auto;
    grid-template-columns: 2.5rem 1fr 1rem;
    align-items: center;
    justify-content: flex-start;
    margin: 0 -0.5rem;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    color: black;
    font-size: 1rem;
    border-radius: 1rem;

    &:hover {
      background: rgba($color-bg, 0.5);

      > .product__edited {
        color: $color-grey-700;
      }

      .fa {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .fa {
      grid-row: 1 / span all;
      margin-left: auto;
      color: $color-grey-300;
      transform: translateX(-0.75rem);
      opacity: 0;
      transition: all 0.2s ease-out;
    }
  }
}

.toggle__wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0 -1rem;
}

.expand-enter-active,
.expand-enter-leave {
  overflow: hidden;
  transition: all 0.25s ease-in-out;
}

.details {
  max-height: 10rem;
  margin-top: 0.5rem;
  padding-right: 2.25rem;
  padding-bottom: 1rem;
  padding-left: 3.25rem;
  font-size: 0.85rem;
  border-bottom: 1px solid $color-border;
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
</style>
