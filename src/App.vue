<template>
  <div id="app">
    <the-header></the-header>
    <div v-if="!isLoggedIn">
      <h1>Du er ikke logget inn</h1>
      <button @click="login()">Logg inn</button>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';

export default {
  components: {
    TheHeader,
  },

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

    login() {
      this.$login().then(() => {
        location.reload();
      });
    },

    async init() {
      await this.initGapi();
      await this.getAllData();
    },
  },
};
</script>

<style lang="scss">
@import '@/styles/main.scss';

button,
input,
textarea,
#app {
  color: $color-purple;
  font-size: 16px;
  font-family: 'OsloSans', Helvetica, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
