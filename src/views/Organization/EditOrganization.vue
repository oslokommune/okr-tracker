<template>
  <div>
    <PageHeader :data="organization || {}"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <router-link class="sub-nav__element" exact :to="{ name: 'edit-organization' }">{{
            $t('organization.title')
          }}</router-link>
          <router-link class="sub-nav__element" :to="{ name: 'edit-organization-keyres' }">
            {{ $t('organization.objAndKeyres') }}
          </router-link>
        </div>
      </div>
    </nav>

    <div class="content" v-if="organization">
      <router-view :docref="organization.ref"></router-view>
    </div>
  </div>
</template>

<script>
import { organizationListener, isAdmin } from '@/db/db';
import PageHeader from '@/components/PageHeader.vue';
import i18n from '@/locale/i18n';

export default {
  name: 'EditOrganization',

  components: {
    PageHeader,
  },

  data: () => ({
    organization: null,
    unsubscribe: null,
  }),

  async beforeRouteEnter(to, from, next) {
    if (await isAdmin()) {
      next();
    } else {
      next(false);
      throw new Error(i18n.t('errorHandler.noAccess'));
    }
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  created() {
    this.unsubscribe = organizationListener.call(this, this.$route.params.slug);
  },
};
</script>

<style scoped></style>
