<template>
  <header class="header">
    <div class="container navbar">
      <h2 class="title-3">
        <router-link to="/">
          OKR-tracker
        </router-link>
      </h2>
      <!-- <div class="right"> -->
      <button class="btn btn--ghost logout" v-if="isLoggedIn" @click="logout()">Logg ut</button>
      <!-- </div> -->
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return this.$isAuthenticated();
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

  border-bottom: 1px solid grey;
}

.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  h2 {
    margin: 0;
  }

  .logout {
    margin-left: auto;
  }
}
</style>
