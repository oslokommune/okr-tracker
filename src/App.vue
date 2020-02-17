<template>
  <div class="app">
    <main class="main">
      <the-header></the-header>
      <router-view class="home"></router-view>
    </main>
    <transition>
      <Newsfeed v-show="user && showNewsfeed" class="newsfeed" @close="set_show_newsfeed(false)"></Newsfeed>
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';
import Newsfeed from '@/views/Home/components/Newsfeed.vue';

export default {
  computed: {
    ...mapState(['user', 'showNewsfeed']),
  },

  methods: {
    ...mapMutations(['set_show_newsfeed']),
  },

  components: {
    TheHeader,
    Newsfeed,
  },
};

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', function() {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', function() {
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
