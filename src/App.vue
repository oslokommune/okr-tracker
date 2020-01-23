<template>
  <div id="app">
    <main class="main">
      <the-header></the-header>
      <router-view class="home"></router-view>
    </main>
    <button class="btn btn--borderless open" @click="open">
      <i class="fas fa-stream fa-fw"></i>&nbsp;Vis aktivitet
    </button>
    <transition>
      <Newsfeed v-show="user && showNewsfeed" class="newsfeed" @close="close"></Newsfeed>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';
import Newsfeed from '@/views/Home/components/Newsfeed.vue';

export default {
  data: () => ({
    showNewsfeed: true,
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    close() {
      this.showNewsfeed = false;
    },
    open() {
      this.showNewsfeed = true;
    },
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

button,
input,
textarea,
body {
  color: $color-purple;
  font-size: 15px;
  font-family: 'OsloSans', Helvetica, Arial, sans-serif;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style lang="scss" scoped>
#app {
  display: flex;
}

.main {
  flex-grow: 1;
}

.home {
  min-height: calc(100vh - 5rem);
  padding-bottom: 4rem;
}

.open {
  position: fixed;
  top: 0;
  right: 0;
  display: none;
  height: 3rem;
  font-weight: 700;
  letter-spacing: 0.06rem;
  text-transform: uppercase;

  @media screen and (min-width: 1700px) {
    display: block;
  }

  .fa {
    margin-right: 0;
  }
}

.newsfeed {
  display: none;

  @media screen and (min-width: 1700px) {
    display: block;
  }
}
</style>
