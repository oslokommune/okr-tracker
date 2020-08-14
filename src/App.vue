<template>
  <div class="app">
    <SiteHeader class="header"></SiteHeader>
    <Breadcrumbs></Breadcrumbs>
    <main class="container">
      <SidebarNavigation v-if="user" class="sidebar"></SidebarNavigation>
      <router-view class="main-view"></router-view>
      <footer class="footer">footer</footer>
    </main>
    <Griddle />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '@/locale/i18n';

export default {
  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  components: {
    SidebarNavigation: () => import('@/components/Navigation/Sidebar.vue'),
    SiteHeader: () => import('@/components/Navigation/SiteHeader.vue'),
    Breadcrumbs: () => import('@/components/Navigation/Breadcrumbs.vue'),
  },

  computed: {
    ...mapState(['user']),
  },
};

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', function () {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', function () {
  document.body.classList.remove('using-mouse');
});
</script>

<style lang="scss">
@import '@/styles/main.scss';
</style>

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

.sidebar {
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
  }
  @media screen and (min-width: bp(l)) {
    width: span(10);
  }

  margin-left: span(0, 1);
}

.footer {
  grid-column: 1 / 3;
  background: white;
}
</style>
