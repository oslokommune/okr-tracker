<template>
  <header class="page-header" :class="`page-header--${style}`">
    <div class="container">
      <div class="page-header__container">
        <ul class="breadcrumb" v-if="breadcrumbs">
          <li>
            <router-link to="/"><i class="fas fa-home"></i></router-link>
          </li>
          <li class="breadcrumb__item" v-for="item in breadcrumbs" :key="item.name">
            <router-link v-if="item.routerLinkTo" :to="item.routerLinkTo">{{ item.name }}</router-link>
            <span v-else>{{ item.name }}</span>
          </li>
        </ul>

        <div class="page-header__name" :class="{ 'page-header__name--left': !showImage }">
          <h1 class="title-1">
            <i v-if="icon" :class="`fa fa-fw fa-${icon}`" aria-hidden></i>
            {{ title }}
          </h1>
        </div>

        <img
          v-if="showImage"
          :src="data.photoURL || '/placeholder-image.svg'"
          :alt="`Profilbilde for ${title}`"
          class="page-header__profile-image"
        />
      </div>
    </div>
  </header>
</template>

<script>
import { serializeDocument } from '../util/db';
import { db } from '@/config/firebaseConfig';

export default {
  data: () => ({
    breadcrumbs: [],
  }),

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  computed: {
    title() {
      if (this.data.key_result) return 'Nøkkelresultat';

      return this.data.name || this.data.displayName || 'Laster ...';
    },

    style() {
      return this.$route.matched.reduce((current, next) => {
        return next.meta.headerStyle || current;
      }, '');
    },

    icon() {
      if (this.style === 'admin') return 'dashboard';
      return false;
    },

    showImage() {
      const typesWithImage = ['product', 'edit-product', 'profile', 'department'];
      return typesWithImage.includes(this.style);
    },
  },

  async mounted() {
    this.breadcrumbs = await this.generateBreadcrumbs(this.data);
  },

  watch: {
    async data(data) {
      this.breadcrumbs = await this.generateBreadcrumbs(data);
    },
  },

  methods: {
    async generateBreadcrumbs(data) {
      if (!data || !data.ref || !data.ref.path) return [];
      const ids = data.ref.path.split('/');

      const promises = [];
      while (ids.length > 1) {
        promises.push(db.doc(ids.join('/')).get());
        ids.splice(-2, 2);
      }

      const trail = await Promise.all(promises)
        .then(snapshots => snapshots.map(serializeDocument))
        .then(documents => documents.map(this.getNameAndRouteFromDocument));

      return trail.reverse();
    },

    getNameAndRouteFromDocument(document) {
      const routerLinkTo = this.createRouterLinkFromDocument(document);
      let name = document.name || document.displayName || document.objective_title || document.key_result;

      if (name.length > 24) {
        name = `${name
          .split('')
          .splice(0, 24)
          .join('')}...`;
      }

      return { name, routerLinkTo };
    },

    createRouterLinkFromDocument(document) {
      let docType;
      try {
        docType = document.ref.parent.id;
      } catch {
        return;
      }

      if (docType === 'orgs') {
        return null;
      }
      if (docType === 'products') {
        return { name: 'product', params: { slug: document.slug } };
      }
      if (docType === 'departments') {
        return { name: 'department', params: { slug: document.slug } };
      }

      if (docType === 'key_results') {
        return { name: 'key-result', params: { slug: this.$route.params.slug, keyresid: document.id } };
      }

      if (docType === 'objectives') {
        return null;
      }

      throw new Error('Cannot find document type');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/page-header.scss';
</style>
