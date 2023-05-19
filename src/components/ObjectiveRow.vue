<template>
  <router-link
    class="objective"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
  >
    <h3 class="objective__header title-2">
      <span>{{ objective.name }}</span>
      <span>{{ percent(objective.progression) }}</span>
    </h3>
    <p v-if="showDescription && objective.description">
      {{ objective.description }}
    </p>
    <progress-bar v-if="showProgress" :progression="objective.progression * 100" />
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
    showDescription: {
      type: Boolean,
      default: false,
    },
    showProgress: {
      type: Boolean,
      default: false,
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;

  .title-2 {
    line-height: 1.25;
  }

  &:hover {
    color: var(--color-hover);

    .title-2 {
      color: inherit;
    }
  }
}

.objective__header {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  margin-bottom: 0;
}
</style>
