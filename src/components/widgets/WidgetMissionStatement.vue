<template>
  <widget v-if="activeItem.missionStatement" :title="$t('document.mission')">
    <div class="md">
      <HTML-output :html="activeItem.missionStatement" />
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetMissionStatement',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
    HTMLOutput: () => import('@/components/HTMLOutput.vue'),
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
