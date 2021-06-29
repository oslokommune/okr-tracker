<template>
  <div class="app">
    <SiteHeader class="header"></SiteHeader>
    <Breadcrumbs></Breadcrumbs>
    <main class="container">
      <div class="sidebarContainer"></div>
      <div class="main-view">
        <spinner v-if="loading"></spinner>
        <router-view v-else class="router-view"></router-view>
      </div>
    </main>
    <Griddle v-if="isDev" />
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
      return process.env.NODE_ENV !== 'production';
    },
  },

  created() {
    if (document.querySelector('#spinner')) {
      document.querySelector('#spinner').remove();
    }
  },
  methods: {
    ...mapActions(['initKeycloak', 'reset_state', 'cleanKeycloak']),
    ...mapMutations(['SET_AUTHENTICATION']),

    async signOut() {
      if (this.providers.includes('keycloak')) {
        await this.cleanKeycloak(this.$route.path);
      }

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

.container {
  @include container();
  display: flex;
  flex-wrap: wrap;
}

.sidebarContainer {
  display: none;

  @media screen and (min-width: bp(m)) {
    display: block;
    width: span(3);
  }

  @media screen and (min-width: bp(l)) {
    width: span(2);
  }
}

.main-view {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9);
    margin-left: span(0, 1);
  }
  @media screen and (min-width: bp(l)) {
    width: span(10);
  }
}

.router-view {
  min-height: calc(100vh - 20rem);
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
