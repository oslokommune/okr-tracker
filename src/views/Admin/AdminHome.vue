<template>
  <div>
    <PageHeader :data="{ name: 'Admin' }"></PageHeader>

    <div class="nav-wrapper">
      <div class="container">
        <nav class="nav">
          <router-link class="router-link" :to="{ name: 'admin-users' }">{{ $t('admin.home.users') }}</router-link>
          <router-link class="router-link" :to="{ name: 'admin-objects' }">{{
            $t('admin.home.depsAndProds')
          }}</router-link>
        </nav>
      </div>
    </div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isAdmin } from '@/db/db';
import PageHeader from '@/components/PageHeader.vue';

export default {
  name: 'AdminHome',

  computed: {
    ...mapState(['user']),
  },

  components: {
    PageHeader,
  },

  async beforeRouteEnter(to, from, next) {
    if (await isAdmin()) {
      next();
    } else {
      next('/');
    }
  },
};
</script>

<style lang="scss" scoped>
.nav-wrapper {
  background: #eeeeee;
}

.nav {
  display: flex;
  margin: 0 -0.5rem 2rem;

  .router-link {
    display: block;
    margin: 0 0.5rem;
    padding: 1rem 0.5rem;
    color: black;
    border-bottom: 3px solid transparent;

    &-exact-active {
      border-bottom-color: black;
    }
  }
}
</style>
