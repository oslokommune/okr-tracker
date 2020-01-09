<template>
  <div>
    <div class="container">
      <h1 class="title title-1">Admin</h1>
    </div>

    <div class="nav-wrapper">
      <div class="container">
        <nav class="nav">
          <router-link class="router-link" :to="{ name: 'admin-users' }">Brukere</router-link>
          <router-link class="router-link" :to="{ name: 'admin-objects' }">Data</router-link>
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

export default {
  name: 'Admin',

  computed: {
    ...mapState(['user']),
  },
  watch: {
    user(obj) {
      if (!obj) return;

      if (!this.user.admin) {
        this.$router.push('/');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-wrapper {
  margin-top: 2rem;
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
