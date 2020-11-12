<template>
  <div class="app">
    <SiteHeader class="header"></SiteHeader>
    <Breadcrumbs></Breadcrumbs>
    <main class="container">
      <div class="sidebarContainer">
        <SidebarNavigation v-if="user"></SidebarNavigation>
      </div>
      <div class="main-view">
        <spinner v-if="loading"></spinner>
        <router-view v-else class="router-view"></router-view>
      </div>
    </main>
    <Griddle v-if="isDev" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '@/locale/i18n';

export default {
  name: 'App',

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  components: {
    SidebarNavigation: () => import('@/components/Navigation/Sidebar.vue'),
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
    document.querySelector('#spinner').remove();
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
@import '@/styles/_colors.scss';

.app {
  min-height: 100vh;
  background: $color-bg;
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
</style>
