<template>
  <router-link
    class="objective"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
    :class="{ expanded: user.preferences.view !== 'compact' }"
  >
    <i class="objective__icon fas fa-fw" :class="`fa-${objective.icon || 'trophy'}`" />
    <span class="objective__name">{{ objective.name }}</span>

    <span class="objective__progression-text">{{ percent(objective.progression) }}</span>
    <progress-bar class="objective__progression" :progression="objective.progression" />

    <span v-if="user.preferences.view !== 'compact'" class="objective__description">{{ objective.description }}</span>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'd3-format';

export default {
  name: 'ObjectiveRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

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
  grid-template-columns: 2rem 1fr auto span(1, 0, span(6));
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: black;
  text-decoration: none;

  &.expanded {
    grid-template-columns: 2rem 1fr auto span(2, 0, span(6));
    margin-top: 3rem;
    margin-bottom: 0.5rem;
  }
}

.objective__icon {
  grid-column: 1;
  align-self: start;
  padding-top: 0.15rem;
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
  grid-column: 2 / 3;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}
</style>
