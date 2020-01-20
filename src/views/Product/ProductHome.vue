<template>
  <div>
    <PageHeader :data="product || {}"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <span
            v-for="quarter in quarters"
            :key="quarter.name"
            class="sub-nav__element"
            :class="{ 'router-link-active': quarter === activeQuarter }"
            @click="set_quarter(quarter)"
            >{{ quarter.name }}</span
          >
        </div>
      </div>
    </nav>

    <div class="content" v-if="product">
      <div class="container container--sidebar">
        <ProductSidebar
          :has-edit-permissions="hasEditPermissions"
          :product="product"
          :active-quarter="activeQuarter"
        ></ProductSidebar>

        <main class="content--main content--padding">
          <ProductSummary></ProductSummary>

          <hr />

          <ObjectivesList></ObjectivesList>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';

import PageHeader from '@/components/PageHeader.vue';
import ProductSummary from './components/ProductSummary.vue';
import ProductSidebar from './components/ProductSidebar.vue';
import ObjectivesList from './components/ObjectivesList.vue';

import * as Toast from '@/util/toasts';

export default {
  name: 'Department',

  data: () => ({
    key_results: [],
  }),

  components: {
    PageHeader,
    ProductSidebar,
    ProductSummary,
    ObjectivesList,
  },

  computed: {
    ...mapState(['user', 'quarters', 'product', 'activeQuarter']),

    hasEditPermissions() {
      if (!this.user) return;
      if (this.user.admin) return true;

      return this.product.team.map(d => d.id).includes(this.user.id);
    },
  },

  watch: {
    async product(prod) {
      if (prod.archived) {
        Toast.fourOhFour();
        this.$router.push('/');
      }
    },
  },

  async mounted() {
    this.watchProduct(this.$route.params.slug);
  },

  methods: {
    ...mapActions(['watchProduct']),
    ...mapMutations(['set_quarter']),
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.sub-nav__element {
  cursor: pointer;
  user-select: none;
}

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
</style>
