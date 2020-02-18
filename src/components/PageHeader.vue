<template>
  <header class="page-header" :class="`page-header--${style}`">
    <div class="container">
      <div class="page-header__container">
        <ul class="breadcrumb" v-if="breadcrumbs">
          <li class="breadcrumb__item">
            <router-link to="/"><i class="fas fa-home"></i>Hjem</router-link>
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

        <div class="page-header__profile-image page-header__profile-image--icon" v-if="data.icon">
          <i :class="`fa fa-fw fa-${data.icon}`"></i>
        </div>

        <img
          v-else-if="showImage"
          :src="data.photoURL || '/placeholder-image.svg'"
          :alt="`Profilbilde for ${title}`"
          class="page-header__profile-image"
        />
      </div>
    </div>
  </header>
</template>

<script>
import { serializeDocument } from '@/db/db';
import { db } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';

export default {
  name: 'PageHeader',

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
      if (this.data.description) return 'Nøkkelresultat';
      if (!this.data) return 'Laster ...';

      return this.data.name || this.data.displayName || this.data.id || 'Laster ...';
    },

    style() {
      return this.$route.matched.reduce((current, next) => {
        return next.meta.headerStyle || current;
      }, '');
    },

    icon() {
      if (this.style === 'admin') return 'tachometer-alt';
      if (this.style === 'help') return 'question-circle';
      return false;
    },

    showImage() {
      const typesWithImage = ['product', 'edit-product', 'profile', 'department', 'me'];
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
        .then(documents => documents.map(this.getNameAndRouteFromDocument))
        .catch(err => {
          this.$errorHandler('generate_breadcrumbs_error', err);
        });

      return trail.reverse();
    },

    getNameAndRouteFromDocument(document) {
      const routerLinkTo = this.createRouterLinkFromDocument(document);
      let name = document.name || document.displayName || document.name || document.description || document.id;

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

      if (docType === 'keyResults') {
        return { name: 'key-result', params: { slug: this.$route.params.slug, keyresid: document.id } };
      }

      if (docType === 'objectives') {
        return null;
      }

      if (docType === 'users') {
        return null;
      }

      Toast.error();
      throw new Error('Cannot find document type');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/page-header.scss';
</style>
