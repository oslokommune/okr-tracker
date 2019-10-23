<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      <h1>Du er ikke logget inn</h1>
      <button @click="login()">Logg inn</button>
    </div>
    <div v-else>
      <button @click="logout()">Logg ut</button>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  computed: {
    isLoggedIn() {
      return this.$isAuthenticated();
    },
  },

  mounted() {
    if (this.$isAuthenticated()) {
      this.init();
    }
  },

  methods: {
    ...mapActions(['initGapi', 'getAllData']),

    logout() {
      this.$logout().then(() => {
        location.reload();
      });
    },

    login() {
      this.$login().then(() => {
        location.reload();
      });
    },

    async init() {
      await this.initGapi(this);
      await this.getAllData();
    },
  },
};
</script>

<style lang="scss">
#app {
  color: #2c3e50;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
