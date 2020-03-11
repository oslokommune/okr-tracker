<template>
  <div>
    <PageHeader :data="organization || {}"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <router-link class="sub-nav__element" exact :to="{ name: 'edit-organization' }">Organisasjon</router-link>
          <router-link class="sub-nav__element" :to="{ name: 'edit-organization-keyres' }">
            Mål og nøkkelresultater
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
      throw new Error('You do not have access to this page!');
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
