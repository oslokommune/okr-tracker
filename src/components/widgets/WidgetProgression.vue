<template>
  <widget :title="getTitle()">
    <progression-chart :dimmed="dimmed" />
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
    dimmed: {
      type: Boolean,
      required: false,
      default: false,
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
