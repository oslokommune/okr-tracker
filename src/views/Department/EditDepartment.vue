<template>
  <div>
    <PageHeader :data="department || {}"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <router-link class="sub-nav__element" exact :to="{ name: 'edit-department' }">Produkt</router-link>
          <router-link class="sub-nav__element" :to="{ name: 'edit-department-keyres' }">
            Mål og nøkkelresultater
          </router-link>
        </div>
      </div>
    </nav>

    <div class="content" v-if="department">
      <router-view :docref="department.ref"></router-view>
    </div>
  </div>
</template>

<script>
import { departmentListener, isAdmin } from '@/db/db';
import PageHeader from '@/components/PageHeader.vue';

export default {
  name: 'Department',

  components: {
    PageHeader,
  },

  data: () => ({
    department: null,
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
    this.unsubscribe = departmentListener.call(this, this.$route.params.slug);
  },
};
</script>

<style lang="scss" scoped></style>
