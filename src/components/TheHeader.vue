<template>
  <header class="header">
    <div class="container navbar">
      <h2 class="title-3">
        <router-link to="/">
          OKR-tracker
        </router-link>
      </h2>
      <div class="right" v-if="user">
        <span v-if="user.isDashboardUser">Dashboard</span>
        <router-link class="menu-item" v-if="user" :to="{ name: 'profile' }">{{ user.displayName }}</router-link>
        <router-link class="menu-item" v-if="user && user.admin" :to="{ name: 'admin-users' }">Admin</router-link>
        <button @click="logout">Logg ut</button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import { auth } from '../config/firebaseConfig';

export default {
  data: () => ({
    auth,
  }),

  computed: {
    ...mapState(['user']),
  },
  methods: {
    logout() {
      auth.signOut().then(() => {
        this.$router.push('/login');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.header {
  width: 100%;
  height: 5rem;
}

.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  h2 {
    margin: 0;
  }

  .right {
    margin-left: auto;
  }

  .menu-item {
    display: inline-block;
    margin: 0 0.25rem;
    padding: 0.55rem 0.75rem;
  }
}
</style>
