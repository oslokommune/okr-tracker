<template>
  <router-link class="objective" to="#">
    <span class="objective__icon fas fa-fw" :class="`fa-${objective.icon || 'trophy'}`"></span>
    <span class="objective__name">{{ objective.name }}</span>

    <ProgressBar class="objective__progression" :progression="objective.progression"></ProgressBar>
  </router-link>
</template>

<script>
export default {
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: grid;
  grid-template-columns: 1.5rem 1fr span(1, 0, span(6));
  align-items: baseline;
  padding: 0.5rem 0.75rem;
  color: black;
  text-decoration: none;
}

.objective__icon {
  grid-column: 1;
}

.objective__name {
  grid-column: 2;
  font-weight: 500;
}

.objective__progression {
  grid-column: 3;
}
</style>
