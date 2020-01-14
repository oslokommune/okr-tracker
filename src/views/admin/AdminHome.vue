<template>
  <div>
    <header class="page-header page-header--admin">
      <div class="container">
        <div class="page-header__container">
          <div class="page-header__name page-header__name--left">
            <h1 class="title-1">Admin</h1>
          </div>
        </div>
      </div>
    </header>

    <div class="nav-wrapper">
      <div class="container">
        <nav class="nav">
          <router-link class="router-link" :to="{ name: 'admin-users' }">Brukere</router-link>
          <router-link class="router-link" :to="{ name: 'admin-objects' }">Produkter og produktområder</router-link>
        </nav>
      </div>
    </div>
    <div class="container content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isAdmin } from '@/util/db';

export default {
  name: 'Admin',

  computed: {
    ...mapState(['user']),
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
