<template>
  <router-view v-if="activeItem" v-show="!loading"></router-view>
  <empty-page
    v-else
    :heading="$t('notFound.title')"
    :body="$t('notFound.body')"
    skin="warning"
  >
    <router-link :to="{ name: 'Home' }" class="pkt-link">
      <pkt-icon class="pkt-link__icon" name="chevron-left" />
      {{ $t('notFound.linkText') }}
    </router-link>
  </empty-page>
</template>

<script>
import { mapState } from 'vuex';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import { itemCommon as routerGuard } from '@/router/router-guards';

export default {
  name: 'ItemWrapper',

  components: {
    EmptyPage,
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
