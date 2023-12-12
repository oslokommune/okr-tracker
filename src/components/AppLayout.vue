<template>
  <div class="app-wrapper">
    <site-header />

    <v-spinner v-if="loading" />

    <div v-else class="router-view-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SiteHeader from './Navigation/SiteHeader.vue';

export default {
  name: 'AppLayout',
  components: {
    SiteHeader,
  },

  computed: {
    ...mapState(['loading']),
  },

  created() {
    if (document.querySelector('#spinner')) {
      document.querySelector('#spinner').remove();
    }
  },
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.router-view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
