<template>
  <div>
    <router-view v-show="!loading"></router-view>
  </div>
</template>

<script>
import { itemHome as routerGuard } from '@/router/router-guards';

export default {
  data: () => ({
    loading: true,
  }),

  mounted() {
    this.loading = false;
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
};
</script>
