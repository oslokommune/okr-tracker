<template>
  <div>
    <page-header :data="product || {}"></page-header>

    <the-sub-nav />

    <div class="content" v-if="product">
      <div class="container container--sidebar">
        <document-sidebar
          :has-edit-permissions="hasEditPermissions"
          :document="product"
          :active-quarter="activeQuarter"
          type="product"
        ></document-sidebar>

        <main class="content--main content--padding">
          <callout-upload-product-image></callout-upload-product-image>

          <document-summary :document="product" :team="team" type="product"></document-summary>

          <hr />

          <objectives-list :document="product"></objectives-list>
        </main>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { serializeDocument } from '@/db/db';

import PageHeader from '@/components/PageHeader.vue';
import DocumentSummary from '@/components/DocumentSummary.vue';
import ObjectivesList from '@/components/ObjectivesList.vue';
import DocumentSidebar from '@/components/DocumentSidebar.vue';
import TheSubNav from '@/components/TheSubNav.vue';
import CalloutUploadProductImage from '@/components/Callouts/CalloutUploadProductImage.vue';
import slugify from '@/util/slugify';

import * as Toast from '@/util/toasts';

export default {
  name: 'ProductHome',

  data: () => ({
    keyResults: [],
    team: [],
  }),

  props: {
    period: {
      type: String,
      required: false,
      default: () => '',
    },
  },

  components: {
    DocumentSidebar,
    PageHeader,
    DocumentSummary,
    ObjectivesList,
    TheSubNav,
    CalloutUploadProductImage,
  },

  computed: {
    ...mapState(['user', 'product', 'activeQuarter']),

    slug() {
      return this.$route.params.slug;
    },

    hasEditPermissions() {
      if (!this.user) return;
      if (this.user.admin) return true;
      if (!this.product.team || !this.product.team.length) return;

      return this.product.team.map(d => d.id).includes(this.user.id);
    },
  },

  watch: {
    slug(slug) {
      this.watchProduct(slug);
    },

    async product(prod) {
      if (!this.period) {
        const firstPeriod = Object.keys(prod.progressions)[0];
        this.$router.push({ query: { period: slugify(firstPeriod) } });
      }

      if (prod.archived) {
        Toast.fourOhFour();
        this.$router.push('/');
      } else {
        const teamPromises = this.product.team ? this.product.team.map(d => d.get()) : [];
        this.team = await Promise.all(teamPromises)
          .then(d => d.map(serializeDocument))
          .catch(err => {
            this.$errorHandler('get_product', this.user.email, this.$route.path, err);
          });
      }
    },
  },

  created() {
    this.watchProduct(this.slug);
  },

  methods: {
    ...mapActions(['watchProduct']),
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors';

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
