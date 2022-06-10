<template>
  <div class="objectiveProgression">
    <div class="objectiveProgression__name">{{ objective.name }}</div>
    <div class="objectiveProgression__progress">
      {{ objective.progression * 100 }}%
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjectiveProgression',

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.objectiveProgression {
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  color: var(--color-text);

  &__name {
    margin-right: 1rem;
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
