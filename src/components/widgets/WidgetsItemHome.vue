<template>
  <aside v-if="activeItem" class="widgets">
    <WidgetProgression v-if="activeItem"></WidgetProgression>
    <WidgetMissionStatement v-if="activeItem"></WidgetMissionStatement>
    <WidgetTeam v-if="activePeriod"></WidgetTeam>
    <WidgetChildItems></WidgetChildItems>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem', 'activePeriod']),
  },
  components: {
    WidgetProgression: () => import('./WidgetProgression.vue'),
    WidgetMissionStatement: () => import('./WidgetMissionStatement.vue'),
    WidgetTeam: () => import('./WidgetTeam.vue'),
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },
};
</script>

<style lang="scss" scoped></style>
