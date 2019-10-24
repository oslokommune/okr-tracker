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

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', function() {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', function() {
  document.body.classList.remove('using-mouse');
});
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
