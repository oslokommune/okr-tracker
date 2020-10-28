<template>
  <aside v-if="activeItem" class="wrapper">
    <div class="itemHome">
      <router-link
        class="btn btn--ter btn--icon"
        v-if="hasEditRights"
        :to="{ name: 'ItemAdmin' }"
        v-tooltip="$t('tooltip.editItem')"
      >
        <i class="icon fa fa-cog"></i>
        {{ $t('btn.editItem', { item: this.activeItem.name }) }}
      </router-link>
      <router-link
        class="btn btn--ter btn--icon"
        :to="!disabled ? { name: 'Dashboard', params: { slug: activeItem.slug } } : ''"
        v-tooltip="disabled ? '' : $t('tooltip.dashboard')"
      >
        <i class="icon fas fa-tachometer-alt"></i>
        {{ $t('general.dashboard') }}
      </router-link>
    </div>

    <div class="widgets">
      <WidgetMissionStatement widget-id="itemHome.missionStatement" v-if="activeItem"></WidgetMissionStatement>
      <WidgetProgression
        widget-id="itemHome.progression"
        v-if="activePeriod"
        type="period"
        :data="activePeriod"
      ></WidgetProgression>
      <WidgetTeam widget-id="itemHome.team" v-if="activePeriod"></WidgetTeam>
      <WidgetChildItems widget-id="itemHome.children"></WidgetChildItems>
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'WidgetsItemHome',

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'user']),
    ...mapGetters(['hasEditRights']),
  },

  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },

  watch: {
    activePeriod: {
      immediate: true,
      handler() {
        this.disabled = !this.activePeriod;
      },
    },
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
