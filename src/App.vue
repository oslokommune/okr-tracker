<template>
  <div class="app">
    <app-layout />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { auth } from '@/config/firebaseConfig';

import AppLayout from './components/AppLayout.vue';

export default {
  name: 'App',

  components: {
    AppLayout,
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

/*
 * The swagger-ui package loads zenscroll, which overrides scolling behavior of
 * *every* anchor tag on every page by placing a nasty click event listener on
 * the main `html` element. In order to disable this, we have to do the
 * following before the swagger-ui package even loads.
 */
window.noZensmooth = true;
</script>
