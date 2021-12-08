<template>
  <div class="app">
    <SiteHeader class="header"></SiteHeader>
    <v-spinner v-if="loading"></v-spinner>
    <router-view v-else></router-view>
    <vue-griddle />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import i18n from '@/locale/i18n';
import { auth } from '@/config/firebaseConfig';

export default {
  name: 'App',

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  components: {
    SiteHeader: () => import('@/components/Navigation/SiteHeader.vue'),
  },

  computed: {
    ...mapState(['user', 'loading']),

    isDev() {
      return import.meta.env.NODE_ENV !== 'production';
    },
  },

  created() {
    if (document.querySelector('#spinner')) {
      document.querySelector('#spinner').remove();
    }
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
