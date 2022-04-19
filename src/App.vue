<template>
  <div class="app">
    <app-layout />
    <vue-griddle />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import i18n from '@/locale/i18n';
import { auth } from '@/config/firebaseConfig';

import AppLayout from './components/AppLayout.vue';

export default {
  name: 'App',

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  components: {
    AppLayout,
  },

  computed: {
    ...mapState(['user', 'loading', 'LS_MODE']),

    isDev() {
      return import.meta.env.NODE_ENV !== 'production';
    },
  },

  mounted() {
    if (this.hasInStorage()) {
      const mode = this.getLocalThemeMode();
      this.setThemeMode(mode);
    } else {
      this.setThemeMode('blue');
    }
  },

  methods: {
    ...mapActions(['reset_state', 'setTheme']),

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },

    hasInStorage() {
      const mode = localStorage.getItem(this.LS_MODE);
      return mode !== null && mode !== 'yellow';
    },

    setThemeMode(mode) {
      this.setTheme(mode);
      document.body.setAttribute('data-theme', mode);
    },

    getLocalThemeMode() {
      return localStorage.getItem(this.LS_MODE);
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
