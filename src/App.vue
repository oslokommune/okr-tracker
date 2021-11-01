<template>
  <div class="app">
    <SiteHeader class="header"></SiteHeader>
    <Breadcrumbs></Breadcrumbs>
    <spinner v-if="loading"></spinner>
    <router-view v-else></router-view>
    <Griddle />
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
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
    Breadcrumbs: () => import('@/components/Navigation/Breadcrumbs.vue'),
    Spinner: () => import('@/components/Spinner.vue'),
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

.sidebar {
  position: sticky;
  top: 7.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 8rem);
  padding: 1.5rem 0;
}

.sidebar__group {
  margin-bottom: 1rem;
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}
</style>
