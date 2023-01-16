<template>
  <div class="app">
    <pkt-icons-sprite />
    <app-layout />
    <vue-griddle />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { auth } from '@/config/firebaseConfig';

import AppLayout from './components/AppLayout.vue';
import PktIconsSprite from './components/PktIconsSprite.vue';

export default {
  name: 'App',

  components: {
    AppLayout,
    PktIconsSprite,
  },

  computed: {
    isDev() {
      return import.meta.env.NODE_ENV !== 'production';
    },
  },

  methods: {
    ...mapActions(['reset_state']),

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },
  },
};

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', () => {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', () => {
  document.body.classList.remove('using-mouse');
});
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  background: var(--color-bg);
}
</style>
