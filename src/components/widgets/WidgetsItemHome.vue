<template>
  <aside v-if="activeItem" class="wrapper">
    <div class="itemHome">
      <router-link
        v-if="hasEditRights"
        v-tooltip="$t('tooltip.editItem')"
        class="btn btn--ter btn--icon"
        :to="{ name: 'ItemAdmin' }"
      >
        <i class="icon fa fa-cog"></i>
        {{ $t('btn.editItem', { item: activeItem.name }) }}
      </router-link>
      <router-link
        v-tooltip="disabled ? $t('tooltip.emptyPeriod') : $t('tooltip.dashboard')"
        class="btn btn--ter btn--icon"
        :to="!disabled ? { name: 'Dashboard', params: { slug: activeItem.slug } } : ''"
      >
        <i class="icon fas fa-tachometer-alt"></i>
        {{ $t('general.dashboard') }}
      </router-link>
    </div>

    <div class="widgets">
      <WidgetMissionStatement v-if="activeItem" widget-id="itemHome.missionStatement"></WidgetMissionStatement>
      <WidgetProgression
        v-if="activePeriod"
        widget-id="itemHome.progression"
        type="period"
        :data="activePeriod"
      ></WidgetProgression>
      <WidgetTeam v-if="activePeriod" widget-id="itemHome.team"></WidgetTeam>
      <WidgetChildItems widget-id="itemHome.children"></WidgetChildItems>
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'WidgetsItemHome',

  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'user']),
    ...mapGetters(['hasEditRights']),
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
