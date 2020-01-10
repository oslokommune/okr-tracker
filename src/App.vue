<template>
  <div id="app">
    <the-header></the-header>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';

export default {
  components: {
    TheHeader,
  },

  methods: {
    ...mapActions(['initializeApp']),
  },

  mounted() {
    this.initializeApp();
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
body {
  color: $color-purple;
  font-size: 16px;
  font-family: 'OsloSans', Helvetica, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
