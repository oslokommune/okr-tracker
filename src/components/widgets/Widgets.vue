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

<style lang="scss" scoped>
.widgets {
  width: span(12);
  margin-top: 2rem;

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(10));
    margin-top: 0rem;
  }

  @media screen and (min-width: bp(l)) {
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    margin-left: span(1, 2, span(10));
  }
}
</style>
