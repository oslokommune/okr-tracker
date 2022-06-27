<template>
  <div class="objectiveProgression">
    <div class="objectiveProgression__name">{{ objective.name }}</div>
    <div class="objectiveProgression__progress">
      {{ formatProgression(objective.progression) }}
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';

export default {
  name: 'ObjectiveProgression',

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  methods: {
    formatProgression(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objectiveProgression {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);

  &__name {
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: var(--font-size-1);
    line-height: 1.25rem;
  }

  &__progress {
    font-weight: 500;
    font-size: var(--font-size-3);
    line-height: 25px;
  }
}
</style>
