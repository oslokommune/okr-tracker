<template>
  <aside v-if="activeItem" class="wrapper">
    <div class="itemHome">
      <router-link class="btn btn--ter btn--icon" v-if="user.admin" :to="{ name: 'ItemAdmin' }">
        <i class="icon fa fa-cog"></i>
        Admin
      </router-link>
      <router-link class="btn btn--ter btn--icon" :to="{ name: 'Dashboard', params: { slug: activeItem.slug } }">
        <i class="icon fas fa-tachometer-alt"></i>
        Dashboard
      </router-link>
    </div>

    <img v-if="activeItem.photoURL" :src="activeItem.photoURL" :alt="activeItem.photoURL" class="image" />

    <div class="widgets">
      <WidgetProgression widget-id="itemHome.progression" v-if="activePeriod" :data="activePeriod"></WidgetProgression>
      <WidgetMissionStatement widget-id="itemHome.missionStatement" v-if="activeItem"></WidgetMissionStatement>
      <WidgetTeam widget-id="itemHome.team" v-if="activePeriod"></WidgetTeam>
      <WidgetChildItems widget-id="itemHome.children"></WidgetChildItems>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem', 'activePeriod', 'user']),
  },
  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  margin-top: 0.5rem;
}
.widgets > .btn {
  margin-bottom: 1.5rem;
}

.image {
  width: 100%;
  height: 20rem;
  margin-bottom: 3rem;
  object-fit: cover;
}

.itemHome {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 1.75rem 0 1rem;

  & > .btn {
    width: 100%;
  }
}
</style>
