<template>
  <div class="app-wrapper">
    <site-header />
    <slider-container>
      <site-sidebar v-if="drawer.type === 'menu'" />
      <edit-objective v-else-if="drawer.type === 'objective'" :data="drawer.data" />
      <saved-objective v-else-if="drawer.type === 'savedObjective'" :data="drawer.data" />
      <edit-key-result v-else-if="drawer.type === 'keyResult'" :data="drawer.data" />
      <saved-key-result
        v-else-if="drawer.type === 'savedKeyResult'"
        :data="drawer.data"
      />
    </slider-container>
    <v-spinner v-if="loading" />

    <div v-else class="router-view-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SliderContainer from '@/components/drawers/SliderContainer.vue';
import EditObjective from '@/components/drawers/EditObjective.vue';
import SavedObjective from '@/components/drawers/SavedObjective.vue';
import EditKeyResult from '@/components/drawers/EditKeyResult.vue';
import SavedKeyResult from '@/components/drawers/SavedKeyResult.vue';
import SiteHeader from './Navigation/SiteHeader.vue';

export default {
  name: 'AppLayout',
  components: {
    SiteHeader,
    SliderContainer,
    EditObjective,
    SavedObjective,
    EditKeyResult,
    SavedKeyResult,
  },

  data: () => ({
    showAsideLeft: false,
    showAsideRight: false,
    isLoading: false,
  }),

  computed: {
    ...mapState(['loading', 'user', 'drawer']),
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
  height: 100vh;
}

.router-view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: scroll;
}
</style>
