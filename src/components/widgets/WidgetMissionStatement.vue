<template>
  <widget v-if="activeItem.missionStatement" :title="$t('document.mission')">
    <div class="md" v-html="content"></div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { marked } from 'marked';
import dompurify from 'dompurify';

export default {
  name: 'WidgetMissionStatement',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
  },

  data: () => ({
    content: '',
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  watch: {
    activeItem: {
      deep: true,
      immediate: true,
      async handler(item) {
        this.content = await dompurify.sanitize(marked(item.missionStatement));
      },
    },
  },
};
</script>
