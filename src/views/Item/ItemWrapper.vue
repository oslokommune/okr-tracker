<template>
  <router-view v-if="activeItem" v-show="!loading"></router-view>
  <not-found-page v-else back-to="Home" />
</template>

<script>
import { mapState } from 'vuex';
import { itemCommon as routerGuard } from '@/router/router-guards';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

export default {
  name: 'ItemWrapper',

  components: {
    NotFoundPage,
  },

  async beforeRouteUpdate(to, from, next) {
    this.loading = true;
    if (to.params.slug !== from.params.slug) {
      await routerGuard(to, from, next);
      this.loading = false;
    } else {
      this.loading = false;
      next();
    }
  },

  data: () => ({
    loading: true,
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  mounted() {
    this.loading = false;
  },
};
</script>
