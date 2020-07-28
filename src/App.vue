<template>
  <div class="app">
    <main class="main">
      <router-view class="home"></router-view>
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

  computed: {
    ...mapState(['user', 'showNewsfeed']),
  },

  methods: {
    ...mapMutations(['SET_SHOW_NEWSFEED']),
  },

  components: {},
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
.app {
  display: flex;
}

.main {
  flex-grow: 1;
}

.home {
  min-height: calc(100vh - 5rem);
  padding-bottom: 4rem;
}
</style>
