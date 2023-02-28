<template>
  <widget :title="getTitle()">
    <progression-chart />
  </widget>
</template>

<script>
export default {
  name: 'WidgetProgression',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
    ProgressionChart: () => import('@/components/ProgressionChart.vue'),
  },

  props: {
    title: {
      type: String,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
  },

  methods: {
    getTitle() {
      return this.$t(`widget.progression.${this.type}`);
    },
  },
};
</script>
