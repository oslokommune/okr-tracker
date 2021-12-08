<template>
  <router-link class="objective" :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }">
    <h3 class="objective__header title-2">
      <span>{{ objective.name }}</span>
      <span>{{ percent(objective.progression) }}</span>
    </h3>
    <span>{{ objective.description }}</span>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'd3-format';

export default {
  name: 'ObjectiveRow',

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['user']),
  },

  methods: {
    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: grid;
  grid-gap: 0.25rem;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr;
  align-items: center;
  padding: 2.5rem 2rem 2rem 2rem;
  color: var(--color-text);
  text-decoration: none;
}

.objective__header {
  display: flex;
  justify-content: space-between;
}
</style>
