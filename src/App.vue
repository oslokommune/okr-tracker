<template>
  <div id="app">
    <the-header></the-header>
    <the-login v-if="!isLoggedIn"></the-login>
    <router-view v-else></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';
import TheLogin from '@/components/TheLogin.vue';

export default {
  components: {
    TheHeader,
    TheLogin,
  },

  computed: {
    isLoggedIn() {
      return this.$isAuthenticated();
    },
  },

  mounted() {
    if (this.isLoggedIn) {
      this.init();
    }
  },

  methods: {
    ...mapActions(['initGapi', 'getAllData']),

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
