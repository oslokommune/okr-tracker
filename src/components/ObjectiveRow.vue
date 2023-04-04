<template>
  <router-link
    class="objective"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
  >
    <h3 class="objective__header title-2">
      <span>{{ objective.name }}</span>
      <span>{{ percent(objective.progression) }}</span>
    </h3>
    <p v-if="showDescription && objective.description" class="objective__description">
      {{ objective.description }}
    </p>
    <div v-if="showProgress" class="objective__spacer"></div>
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
  display: grid;
  grid-gap: 0.25rem;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr;
  align-items: center;
  padding: 2.5rem 2rem 2rem 2rem;
  color: var(--color-text);
  text-decoration: none;
  background: var(--color-white);

  &:hover {
    color: var(--color-hover);

    .title-2 {
      color: inherit;
    }
  }
}

.objective__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
}

.objective__description {
  margin-top: 0.25rem;
  line-height: 1.5rem;
}

.objective__spacer {
  height: 1.5rem;
}
</style>
