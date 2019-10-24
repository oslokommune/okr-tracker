<template>
  <header class="header">
    <div class="container navbar">
      <h2 class="title-3">
        <router-link to="/">
          OKR-tracker
        </router-link>
      </h2>
      <div class="right">
        <router-link v-if="isHomePage" class="btn btn--ghost" :to="{ name: 'add-product' }"
          >+ Legg til nytt produkt</router-link
        >
        <button class="btn btn--ghost" v-if="isLoggedIn" @click="logout()">Logg ut</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return this.$isAuthenticated();
    },
    isHomePage() {
      return this.$route.name === 'home';
    },
  },

  methods: {
    logout() {
      this.$logout().then(() => {
        location.reload();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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
}
</style>
