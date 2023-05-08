<template>
  <div class="app-wrapper">
    <site-header
      :toggle-show-aside-left="toggleShowAsideLeft"
      :toggle-show-aside-right="toggleShowAsideRight"
    />
    <router-view name="SubNav" />
    <slider-container
      :is-open="showAsideLeft"
      :toggle="toggleShowAsideLeft"
      :should-slide-in-from-left="true"
      :has-primary-background="true"
    >
      <site-sidebar :handle-navigation="toggleShowAsideLeft" />
    </slider-container>
    <slider-container
      v-if="user"
      :is-open="showAsideRight"
      :toggle="toggleShowAsideRight"
      :should-slide-in-from-left="false"
    >
      <user-profile-menu :id="user.id" />
    </slider-container>
    <v-spinner v-if="loading" />
    <div v-else class="router-view-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SliderContainer from '@/components/SliderContainer.vue';
import SiteHeader from './Navigation/SiteHeader.vue';
import SiteSidebar from './Navigation/SiteSidebar.vue';
import UserProfileMenu from './UserProfileMenu.vue';

export default {
  name: 'AppLayout',
  components: { SiteHeader, SiteSidebar, SliderContainer, UserProfileMenu },

  data: () => ({
    showAsideLeft: false,
    showAsideRight: false,
    isLoading: false,
  }),

  computed: {
    ...mapState(['loading', 'user']),
  },

  created() {
    if (document.querySelector('#spinner')) {
      document.querySelector('#spinner').remove();
    }
  },

  methods: {
    toggleShowAsideLeft() {
      this.showAsideLeft = !this.showAsideLeft;
    },
    toggleShowAsideRight() {
      this.showAsideRight = !this.showAsideRight;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.router-view-wrapper {
  overflow-y: scroll;
}
</style>
