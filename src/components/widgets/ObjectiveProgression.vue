<template>
  <div class="widget">
    <header class="widget__header">
      <h3 class="title-3">{{ objective.name }}</h3>
    </header>
    <div class="widget__body">
      <progression-chart />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjectiveProgression',

  components: {
    ProgressionChart: () => import('@/components/ProgressionChart.vue'),
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
};
</script>
