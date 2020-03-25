<template>
  <div>
    <page-header :data="product || {}"></page-header>

    <the-sub-nav v-if="product" :document="product" />

    <div class="content" v-if="product">
      <div class="container container--sidebar">
        <document-sidebar
          :has-edit-permissions="hasEditPermissions"
          :document="product"
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
import { mapState, mapActions, mapMutations } from 'vuex';
import { serializeDocument, serializeList } from '@/db/db';

import PageHeader from '@/components/PageHeader.vue';
import DocumentSummary from '@/components/DocumentSummary.vue';
import ObjectivesList from '@/components/ObjectivesList.vue';
import DocumentSidebar from '@/components/DocumentSidebar.vue';
import TheSubNav from '@/components/TheSubNav.vue';
import CalloutUploadProductImage from '@/components/Callouts/CalloutUploadProductImage.vue';
import slugify from '@/util/slugify';
import i18n from '@/locale/i18n';

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

  metaInfo() {
    return {
      title: `${this.product ? this.product.name : i18n.t('general.product')} | ${i18n.t('general.project')}`,
    };
  },

  computed: {
    ...mapState(['user', 'product']),

    slug() {
      return this.$route.params.slug;
    },

    queryParamPeriod() {
      return this.$route.query.period;
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
      if (!slug) return;
      this.watchProduct(slug);
    },

    queryParamPeriod() {
      this.setPeriod();
    },

    async product(prod) {
      this.setPeriod();

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
    if (!this.slug) return;
    this.watchProduct(this.slug);
    this.setPeriod();
  },

  methods: {
    ...mapActions(['watchProduct']),
    ...mapMutations(['SET_ACTIVE_PERIOD']),

    async setPeriod() {
      if (!this.product) return;

      const periods = await this.product.ref
        .collection('periods')
        .get()
        .then(serializeList)
        .then(docs => docs.filter(doc => doc.startDate.toDate() < new Date()))
        .then(docs =>
          docs.sort((a, b) => {
            if (a.startDate.seconds < b.startDate.seconds) return 1;
            if (a.startDate.seconds > b.startDate.seconds) return -1;
            return 0;
          })
        );

      let activePeriod;

      if (!this.queryParamPeriod) {
        const [firstPeriod] = periods;
        activePeriod = firstPeriod;
      } else {
        activePeriod = periods.find(period => slugify(period.name) === this.queryParamPeriod);
      }

      if (!activePeriod) {
        this.SET_ACTIVE_PERIOD(null);
      } else {
        activePeriod.ref.onSnapshot(snapshot => {
          const period = serializeDocument(snapshot);
          this.SET_ACTIVE_PERIOD(period);
        });
      }
    },
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
