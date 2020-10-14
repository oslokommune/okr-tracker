<template>
  <router-link
    class="objective"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
    :class="{ expanded: user.preferences.view !== 'compact' }"
  >
    <span class="objective__icon fas fa-fw" :class="`fa-${objective.icon || 'trophy'}`"></span>
    <span class="objective__name">{{ objective.name }}</span>

    <span class="objective__progression-text">{{ Math.round(objective.progression * 100) }} %</span>
    <ProgressBar class="objective__progression" :progression="objective.progression"></ProgressBar>

    <span v-if="user.preferences.view !== 'compact'" class="objective__description">{{ objective.description }}</span>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['user']),
  },

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1.5rem 1fr auto span(1, 0, span(6));
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: black;
  text-decoration: none;
  border-bottom: 1px solid rgba(black, 0.1);

  &.expanded {
    grid-template-columns: 1.5rem 1fr auto span(2, 0, span(6));
  }
}

.objective__icon {
  grid-column: 1;
}

.objective__name {
  grid-column: 2;
  font-weight: 500;
}

.objective__progression-text {
  grid-column: 3;
  margin-right: 1rem;
  font-size: 0.8rem;
  text-align: right;
}

.objective__progression {
  grid-column: 4;
}

.objective__description {
  grid-row: 2;
  grid-column: 2 / 4;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}
</style>
