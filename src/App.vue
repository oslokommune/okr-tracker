<template>
  <div class="l-app">
    <header class="l-header">
      <router-link to="/">Home</router-link>
    </header>
    <main class="l-main">
      <SidebarNavigation class="l-sidebar"></SidebarNavigation>
      <router-view class="l-router-view"></router-view>
      <footer class="l-footer"></footer>
    </main>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import i18n from '@/locale/i18n';

export default {
  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  components: {
    SidebarNavigation: () => import('@/components/Navigation/Sidebar.vue'),
  },

  computed: {
    ...mapState(['user', 'showNewsfeed']),
  },

  methods: {
    ...mapMutations(['SET_SHOW_NEWSFEED']),
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
.l-app {
  display: grid;
  grid-template-rows: auto auto;
}

.l-main {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 24rem 100%;
  max-width: 1200px;
}

.l-router-view {
  width: 100%;
  outline: 1px solid green;
}

.l-sidebar {
  height: calc(100vh - 5rem);
  outline: 1px solid blue;
}

.l-header {
  position: sticky;
  top: 0;
  width: 100%;
  height: 5rem;
}
</style>
