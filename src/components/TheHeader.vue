<template>
  <header class="header">
    <div class="container">
      <button v-if="isLoggedIn" @click="logout()">Logg ut</button>
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
  height: 4rem;
}
</style>
