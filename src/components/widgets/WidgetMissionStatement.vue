<template>
  <widget v-if="activeItem.missionStatement" :widget-id="widgetId" :title="$t('document.mission')" icon="file">
    <div class="md" v-html="content"></div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import marked from 'marked';
import { sanitize } from 'dompurify';

export default {
  name: 'WidgetMissionStatement',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
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
        this.content = await sanitize(marked(item.missionStatement));
      },
    },
  },
};
</script>
