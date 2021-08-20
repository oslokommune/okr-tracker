<template>
  <aside v-if="activeItem">
    <div class="widgets__links">
      <router-link
        v-if="hasEditRights"
        v-tooltip="$t('tooltip.editItem')"
        class="btn btn--ter btn--icon btn--icon-pri"
        :to="{ name: 'ItemAdmin' }"
        data-cy="edit_object_link"
      >
        <i class="icon fa fa-cog" />
        {{ $t('btn.editItem', { item: activeItem.name }) }}
      </router-link>
      <router-link
        v-tooltip="disabled ? $t('tooltip.emptyPeriod') : $t('tooltip.dashboard')"
        class="btn btn--ter btn--icon btn--icon-pri"
        :to="!disabled ? { name: 'Dashboard', params: { slug: activeItem.slug } } : ''"
      >
        <i class="icon fas fa-tachometer-alt" />
        {{ $t('general.dashboard') }}
      </router-link>
    </div>

    <div class="widgets">
      <widget-mission-statement v-if="activeItem" widget-id="itemHome.missionStatement" />
      <widget-progression v-if="activePeriod" widget-id="itemHome.progression" type="period" :data="activePeriod" />
      <widget-team v-if="activeItem" widget-id="itemHome.team" />
      <widget-child-items widget-id="itemHome.children" />
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
    ...mapState(['activeItem', 'activePeriod', 'user', 'dataLoading']),
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
