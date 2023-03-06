<template>
  <router-view v-show="!loading"></router-view>
</template>

<script>
import { itemCommon as routerGuard } from '@/router/router-guards';

export default {
  name: 'ItemWrapper',

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

  mounted() {
    this.loading = false;
  },
};
</script>
