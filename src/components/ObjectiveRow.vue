<template>
  <router-link
    class="objective"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
    :class="{ expanded: user.preferences.view !== 'compact' }"
  >
    <h3 class="objective__header title-2">
      <i class="objective__icon fas fa-fw" :class="`fa-${objective.icon || 'trophy'}`" />
      <span>Objective {{ index }}</span>
      <span class="objective__progression-text">{{ percent(objective.progression) }}</span>
    </h3>

    <div>
      <span class="objective__name">{{ objective.name }}</span>
      <span v-if="user.preferences.view !== 'compact'" class="objective__description">{{ objective.description }}</span>
    </div>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'd3';

export default {
  name: 'ObjectiveRow',

  props: {
    objective: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
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
  padding: 1.5rem 1.75rem;
  color: var(--color-text);
  text-decoration: none;
}

.objective__header {
  text-transform: uppercase;
}

.objective__description {
}

.objective__icon {
  margin-right: 0.5rem;
}

.objective__progression-text {
  margin-left: 2rem;
}
</style>
