<template>
  <div>
    <site-header :toggle-show-aside-left="toggleShowAsideLeft" :toggle-show-aside-right="toggleShowAsideRight" />
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
      <user-profile-menu :id="user.id" /> />
    </slider-container>
    <v-spinner v-if="loading" />
    <router-view v-else></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SiteHeader from './Navigation/SiteHeader.vue';
import SiteSidebar from './Navigation/SiteSidebar.vue';
import SliderContainer from '@/components/SliderContainer.vue';
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

<style lang="scss" scoped></style>
